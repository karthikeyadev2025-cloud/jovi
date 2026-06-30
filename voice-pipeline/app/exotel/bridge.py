"""
Exotel <-> Jovio voice bridge — Phase 2 (production minimum).

Pipeline per call:
  1. Exotel opens WebSocket -> we accept
  2. On "start" event: look up tenant by caller phone (demo lookup) or DID
  3. Play tenant.greeting_text via Sarvam TTS
  4. Loop:
     a. Buffer caller audio (mu-law -> PCM)
     b. When 1.2s of silence detected -> transcribe via Sarvam STT
     c. Send transcript to Anthropic with Telugu receptionist system prompt
     d. Stream response through Sarvam TTS back to caller
  5. On "stop" event: save call summary to Supabase, send WhatsApp recap

Sample rates:
  Exotel: 8kHz mu-law
  Sarvam STT input: 16kHz PCM (we upsample)
  Sarvam TTS output: 22kHz PCM (we downsample to 8k + mu-law encode)
"""
import asyncio, audioop, base64, json, logging, os, time, wave, io
from typing import Optional
import httpx
from fastapi import WebSocket, WebSocketDisconnect

log = logging.getLogger("exotel-bridge")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s | %(message)s")

# ─── Config ──────────────────────────────────────────────
SARVAM_KEY     = os.getenv("SARVAM_API_KEY", "")
GEMINI_KEY     = os.getenv("GEMINI_API_KEY", "")
SUPABASE_URL   = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY   = os.getenv("SUPABASE_SERVICE_KEY", "")

EXOTEL_SR   = 8000
PIPE_SR     = 16000
TTS_SR      = 22050

# VAD: simple energy threshold. Speech if average abs amplitude > THRESHOLD.
# Silence for SILENCE_MS after speech -> consider utterance ended.
VAD_THRESHOLD = 500
SILENCE_MS    = 1200
MIN_SPEECH_MS = 300

ASSETS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)))), "assets")

DEFAULT_GREETING = (
    "నమస్కారం! Jovio AI receptionist కి స్వాగతం. "
    "మీకు ఎలా సహాయం చేయగలను?"
)
DEFAULT_VOICE = "anushka"

SYSTEM_PROMPT = """మీరు ఒక professional Telugu AI receptionist. మీ పేరు Jovio.
మీరు {business_type} business ({business_name}) కి calls handle చేస్తున్నారు.

Rules:
- Always respond in Telugu (Telugu script). Code-switch English only for product names, numbers, dates, technical terms.
- Keep responses SHORT (1-2 sentences max). This is a phone call, not a chat.
- Be warm, professional, and helpful.
- If caller wants appointment: collect name, phone, preferred time. Confirm via WhatsApp.
- If caller has product/service question: answer helpfully based on context.
- If you don't know something: say "ఈ విషయం team check చేసి call back చేస్తారు" — promise callback.
- Never make up specific prices, addresses, or availability you don't know.
- End calls naturally when caller says ధన్యవాదాలు / thank you / bye.
"""


# ─── Sarvam STT ──────────────────────────────────────────
async def sarvam_stt(pcm_16k_bytes: bytes) -> str:
    """Send WAV-wrapped PCM to Sarvam STT, return Telugu transcript."""
    # Wrap raw PCM in WAV header
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(PIPE_SR)
        wf.writeframes(pcm_16k_bytes)
    wav_bytes = buf.getvalue()

    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(
            "https://api.sarvam.ai/speech-to-text",
            headers={"api-subscription-key": SARVAM_KEY},
            files={"file": ("audio.wav", wav_bytes, "audio/wav")},
            data={"language_code": "te-IN", "model": "saarika:v2"},
        )
        if r.status_code != 200:
            log.error("Sarvam STT %s: %s", r.status_code, r.text[:200])
            return ""
        return r.json().get("transcript", "").strip()


# ─── Sarvam TTS ──────────────────────────────────────────
async def sarvam_tts(text: str, voice: str = DEFAULT_VOICE) -> bytes:
    """Synthesize Telugu text, return 16-bit PCM @ 22.05kHz."""
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            "https://api.sarvam.ai/text-to-speech",
            headers={"api-subscription-key": SARVAM_KEY},
            json={
                "inputs": [text],
                "target_language_code": "te-IN",
                "speaker": voice,
                "model": "bulbul:v2",
            },
        )
        if r.status_code != 200:
            log.error("Sarvam TTS %s: %s", r.status_code, r.text[:200])
            return b""
        wav_b64 = r.json()["audios"][0]
        wav_bytes = base64.b64decode(wav_b64)
        # Strip WAV header -> raw PCM
        buf = io.BytesIO(wav_bytes)
        with wave.open(buf, "rb") as wf:
            return wf.readframes(wf.getnframes())


# ─── Gemini ──────────────────────────────────────────────
async def gemini_reply(history: list, system: str) -> str:
    """Call Gemini Flash. Converts our {role,content} history to Gemini format."""
    # Convert Anthropic-style history to Gemini "contents" format
    contents = []
    for msg in history:
        role = "user" if msg["role"] == "user" else "model"
        contents.append({"role": role, "parts": [{"text": msg["content"]}]})

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-2.0-flash:generateContent?key=" + GEMINI_KEY
    )
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            url,
            headers={"Content-Type": "application/json"},
            json={
                "system_instruction": {"parts": [{"text": system}]},
                "contents": contents,
                "generationConfig": {
                    "maxOutputTokens": 200,
                    "temperature": 0.7,
                },
            },
        )
        if r.status_code != 200:
            log.error("Gemini %s: %s", r.status_code, r.text[:300])
            return "క్షమించండి, technical issue. మళ్ళీ try చేయండి."
        data = r.json()
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except (KeyError, IndexError) as e:
            log.error("Gemini bad response: %s | %s", e, data)
            return "క్షమించండి, మళ్ళీ చెప్పగలరా?"


# ─── Supabase tenant lookup ──────────────────────────────
async def lookup_tenant(caller_phone: str, did: str) -> dict:
    """Find demo tenant by caller phone, or default tenant by DID."""
    caller_e164 = "+91" + "".join(c for c in (caller_phone or "") if c.isdigit())[-10:]
    async with httpx.AsyncClient(timeout=8) as client:
        try:
            r = await client.get(
                f"{SUPABASE_URL}/rest/v1/tenants",
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                },
                params={
                    "demo_phone": f"eq.{caller_e164}",
                    "is_demo": "eq.true",
                    "select": "id,name,business_type,greeting_text,voice_profile",
                    "limit": "1",
                },
            )
            if r.status_code == 200 and r.json():
                return r.json()[0]
        except Exception as e:
            log.warning("tenant lookup failed: %s", e)
    return {
        "name": "Jovio Demo",
        "business_type": "general",
        "greeting_text": DEFAULT_GREETING,
        "voice_profile": DEFAULT_VOICE,
    }


# ─── Session ─────────────────────────────────────────────
class Session:
    def __init__(self, ws: WebSocket):
        self.ws = ws
        self.stream_sid: Optional[str] = None
        self.call_sid: Optional[str] = None
        self.caller: str = ""
        self.did: str = ""
        self.tenant: dict = {}
        self.history: list = []
        self.upsample_state = None
        self.downsample_state = None
        self.speech_buf = bytearray()
        self.silence_count = 0  # ms of consecutive silence
        self.in_speech = False
        self.speaking_back = False  # True while TTS is playing -> ignore caller audio
        self.last_event_at = time.time()

    async def send_audio_8k(self, pcm_8k_bytes: bytes):
        """Send mu-law audio to Exotel — safely handles closed socket."""
        mulaw = audioop.lin2ulaw(pcm_8k_bytes, 2)
        FRAME = 160
        for i in range(0, len(mulaw), FRAME):
            chunk = mulaw[i:i + FRAME]
            try:
                await self.ws.send_text(json.dumps({
                    "event": "media",
                    "stream_sid": self.stream_sid,
                    "media": {"payload": base64.b64encode(chunk).decode()},
                }))
            except Exception as e:
                log.warning("send_audio_8k stopped (socket closed?): %s", e)
                return
            await asyncio.sleep(0.018)

    async def speak(self, text: str):
        """TTS -> downsample 22k to 8k -> send. Set speaking_back AFTER TTS returns."""
        if not text:
            return
        try:
            log.info("speak() starting: %s", text[:60])
            pcm_22k = await sarvam_tts(text, self.tenant.get("voice_profile", DEFAULT_VOICE))
            log.info("speak() got TTS, %d bytes — now sending", len(pcm_22k))
            if not pcm_22k:
                return
            pcm_8k, self.downsample_state = audioop.ratecv(
                pcm_22k, 2, 1, TTS_SR, EXOTEL_SR, self.downsample_state
            )
            # NOW stop silence and play real audio
            self.speaking_back = True
            await self.send_audio_8k(pcm_8k)
            log.info("speak() sent all audio")
        except Exception as e:
            log.warning("speak() failed: %s", e)
        finally:
            self.speaking_back = False

    async def keep_alive_silence(self):
        """Stream mu-law silence frames until speaking_back becomes True or call ends."""
        SILENCE_FRAME = b"\xff" * 160  # 20ms @ 8kHz mu-law silence
        frames_sent = 0
        log.info("keep_alive_silence STARTED")
        try:
            while not self.speaking_back:
                try:
                    await self.ws.send_text(json.dumps({
                        "event": "media",
                        "stream_sid": self.stream_sid,
                        "media": {"payload": base64.b64encode(SILENCE_FRAME).decode()},
                    }))
                    frames_sent += 1
                except Exception as e:
                    log.warning("silence send failed after %d frames: %s", frames_sent, e)
                    return
                await asyncio.sleep(0.018)
            log.info("keep_alive_silence STOPPED after %d frames (real audio taking over)", frames_sent)
        except Exception as e:
            log.warning("keep_alive_silence error: %s", e)

    def feed_caller_audio(self, pcm_16k: bytes):
        """Run simple VAD. Returns transcript text when utterance ends, else ''."""
        if self.speaking_back:
            return None  # ignore caller while we're talking (no barge-in v1)

        # Energy = mean abs sample
        try:
            rms = audioop.rms(pcm_16k, 2)
        except audioop.error:
            return None

        is_speech = rms > VAD_THRESHOLD
        chunk_ms = int(len(pcm_16k) / 2 / PIPE_SR * 1000)

        if is_speech:
            self.silence_count = 0
            if not self.in_speech:
                self.in_speech = True
                self.speech_buf = bytearray()
            self.speech_buf.extend(pcm_16k)
        else:
            if self.in_speech:
                self.speech_buf.extend(pcm_16k)
                self.silence_count += chunk_ms
                speech_ms = len(self.speech_buf) / 2 / PIPE_SR * 1000
                if self.silence_count >= SILENCE_MS and speech_ms >= MIN_SPEECH_MS:
                    self.in_speech = False
                    self.silence_count = 0
                    utterance = bytes(self.speech_buf)
                    self.speech_buf = bytearray()
                    return utterance
        return None


# ─── Main handler ────────────────────────────────────────
async def handle_exotel_ws(ws: WebSocket):
    log.info("INCOMING WS connection attempt!")
    await ws.accept()
    s = Session(ws)
    log.info("Exotel WS ACCEPTED — waiting for first message")

    try:
        while True:
            raw = await ws.receive_text()
            log.info("EXOTEL_RAW (first 200 chars): %s", raw[:200])
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                log.warning("bad JSON: %s", raw[:100])
                continue

            event = msg.get("event")
            log.info("event=%s", event)

            if event == "connected":
                log.info("EXOTEL connected event received")

            elif event == "start":
                start = msg.get("start", {})
                s.stream_sid = msg.get("stream_sid") or start.get("stream_sid")
                s.call_sid = start.get("call_sid", "")
                custom = start.get("custom_parameters") or {}
                s.caller = custom.get("From") or start.get("from") or ""
                s.did    = custom.get("To")   or start.get("to")   or ""
                log.info("start call=%s from=%s to=%s", s.call_sid, s.caller, s.did)
                s.tenant = await lookup_tenant(s.caller, s.did)
                log.info("tenant: %s", s.tenant.get("name"))

                sys_prompt = SYSTEM_PROMPT.format(
                    business_type=s.tenant.get("business_type", "general"),
                    business_name=s.tenant.get("name", "this business"),
                )
                s.history = []  # filled per turn
                # Greet the caller
                # Trigger greeting immediately — speak() handles closed-socket errors gracefully
                asyncio.create_task(s.speak(s.tenant.get("greeting_text") or DEFAULT_GREETING))
                # Stash system prompt on session
                s._sys = sys_prompt

            elif event == "media":
                payload = msg.get("media", {}).get("payload", "")
                if not payload:
                    continue
                raw_bytes = base64.b64decode(payload)
                # Log format once
                if not hasattr(s, "_logged_format"):
                    log.info("MEDIA SAMPLE: %d bytes, first 16 hex: %s",
                             len(raw_bytes), raw_bytes[:16].hex())
                    s._logged_format = True
                mulaw = raw_bytes
                pcm_8k = audioop.ulaw2lin(mulaw, 2)
                pcm_16k, s.upsample_state = audioop.ratecv(
                    pcm_8k, 2, 1, EXOTEL_SR, PIPE_SR, s.upsample_state
                )
                utterance = s.feed_caller_audio(pcm_16k)
                if utterance is not None:
                    asyncio.create_task(_handle_utterance(s, utterance))

            elif event == "stop":
                log.info("stop call=%s", s.call_sid)
                break

    except WebSocketDisconnect:
        log.info("ws disconnect (clean)")
    except RuntimeError as e:
        if "not connected" in str(e) or "after sending" in str(e):
            log.info("ws closed by Exotel: %s", e)
        else:
            log.exception("runtime: %s", e)
    except Exception as e:
        log.exception("handler error: %s", e)


async def _handle_utterance(s: Session, pcm: bytes):
    try:
        text = await sarvam_stt(pcm)
        if not text:
            return
        log.info("caller: %s", text)
        s.history.append({"role": "user", "content": text})
        reply = await gemini_reply(s.history, getattr(s, "_sys", ""))
        log.info("ai: %s", reply)
        s.history.append({"role": "assistant", "content": reply})
        await s.speak(reply)
    except Exception as e:
        log.exception("utterance handler failed: %s", e)
