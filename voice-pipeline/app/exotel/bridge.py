"""
Exotel <-> Jovio voice bridge — Phase 2 with pre-cached greeting.
Greeting is pre-baked to mu-law and streamed within ~50ms of 'start'.
Sarvam is only called mid-conversation for dynamic replies.

Recording: the full call audio (caller turns + AI turns, in the order they
actually happened — there's no barge-in yet so this is a faithful timeline)
is buffered in memory as it streams, then on 'stop' it's wrapped as a WAV,
AES-256-GCM encrypted with JOVIO_RECORDING_KEY, and uploaded to Supabase
Storage. A `calls` row is created on 'start' and finalized on 'stop' so the
recording has somewhere to attach (recording_path, duration_seconds).
"""
import asyncio, audioop, base64, json, logging, os, secrets, time, wave, io
from typing import Optional
import httpx
from fastapi import WebSocket, WebSocketDisconnect

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    _HAS_CRYPTO = True
except ImportError:
    _HAS_CRYPTO = False

from app.exotel import knowledge
from app.exotel import circuit_breaker as cb

log = logging.getLogger("exotel-bridge")
logging.basicConfig(level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s | %(message)s")

SARVAM_KEY   = os.getenv("SARVAM_API_KEY", "")
GEMINI_KEY   = os.getenv("GEMINI_API_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

EXOTEL_SR = 8000
PIPE_SR   = 16000
TTS_SR    = 22050

VAD_THRESHOLD = 500
SILENCE_MS    = 1200
MIN_SPEECH_MS = 300

ASSETS_DIR = os.path.join(os.path.dirname(os.path.dirname(
    os.path.dirname(os.path.abspath(__file__)))), "assets")
CACHED_DIR = os.path.join(ASSETS_DIR, "cached_pcm")
DEFAULT_VOICE = "anushka"

SYSTEM_PROMPT = """మీరు ఒక Telugu AI receptionist. మీ పేరు Jovio.
Business: {business_name} ({business_type}).
Rules:
- Respond in Telugu only (code-switch English for names/numbers/dates).
- SHORT responses (1-2 sentences). Phone call, not chat.
- Warm, professional, helpful.
- Appointment: collect name, phone, time. Confirm via WhatsApp.
- Unknown info: "team check చేసి call back చేస్తారు".
- Never invent prices/addresses.
- End when caller says ధన్యవాదాలు/thank you/bye.
"""

# ─── Voice Profile SKUs ─────────────────────────────────────
# Voice IDs MUST come from bulbul:v2's actual speaker catalog — that's the
# model bridge.py calls (see sarvam_tts below, "model":"bulbul:v2"). Verified
# valid speakers for that model: anushka, manisha, vidya, arya (female),
# abhilash, karun, hitesh (male). Speaker names are NOT interchangeable with
# bulbul:v3 — a v3-only name here would silently 400 every TTS call for that
# SKU. (The dashboard's old SKU list used meera/pavithra/arvind, none of
# which exist in either catalog — fixed alongside this.)
SKU_VOICE = {
    "standard":    "anushka",   # proven in production since today's earlier calls
    "clinic":      "vidya",     # formal female tone
    "real_estate": "karun",     # assertive male tone
    "premium":     "manisha",   # distinct, refined female tone
}

SKU_SYSTEM_PROMPTS = {
    "standard": """మీరు ఒక professional Telugu AI receptionist. మీ పేరు Jovio.
Business: {business_name} — general business / retail / coaching.
Rules:
- Respond in Telugu, natural Tanglish code-switching for product names, numbers, dates.
- SHORT responses (1-2 sentences). Phone call, not chat.
- Warm, friendly, approachable tone.
{shared_rules}""",
    "clinic": """మీరు ఒక professional Telugu AI receptionist ఒక clinic/hospital కోసం. మీ పేరు Jovio.
Business: {business_name} — hospital / clinic / diagnostic lab.
Rules:
- Respond in Telugu, formal and careful tone — ఇది ఆరోగ్యానికి సంబంధించిన విషయం.
- SHORT responses (1-2 sentences). Phone call, not chat.
- NEVER give medical advice, diagnosis, or suggest medication — always route clinical
  questions to "డాక్టర్ గారు call back చేస్తారు".
{shared_rules}""",
    "real_estate": """మీరు ఒక professional Telugu AI receptionist ఒక real estate business కోసం. మీ పేరు Jovio.
Business: {business_name} — real estate, site visits, property enquiries.
Rules:
- Respond in Telugu, warm and persuasive tone — site visit లేదా అపాయింట్‌మెంట్ బుక్ చేయమని encourage చేయండి.
- SHORT responses (1-2 sentences). Phone call, not chat.
- If caller mentions budget or location preference, acknowledge it and note it's passed to the team.
{shared_rules}""",
    "premium": """మీరు ఒక professional Telugu AI receptionist ఒక premium/luxury business కోసం. మీ పేరు Jovio.
Business: {business_name} — premium, high-value clientele.
Rules:
- Respond in Telugu, comfortably code-switch to English where it reads as more refined.
- SHORT responses (1-2 sentences). Phone call, not chat.
- Extra courteous, unhurried tone.
{shared_rules}""",
}

SKU_SHARED_RULES = """- Appointment: collect name, phone, time. Confirm via WhatsApp.
- Business hours: {open_time}-{close_time}, {open_days}.
{services_line}{appt_types_line}- Unknown info: "team check చేసి call back చేస్తారు".
- Never invent prices/addresses.
- End when caller says ధన్యవాదాలు/thank you/bye."""


def build_sku_prompt(profile: dict) -> str:
    """Build the SKU-specific system prompt from a voice_profiles row."""
    sku = profile.get("profile_sku") or "standard"
    template = SKU_SYSTEM_PROMPTS.get(sku, SKU_SYSTEM_PROMPTS["standard"])
    services = profile.get("services") or []
    appt_types = profile.get("appointment_types") or []
    open_days = profile.get("open_days") or ["Mon","Tue","Wed","Thu","Fri","Sat"]
    shared = SKU_SHARED_RULES.format(
        open_time=profile.get("open_time") or "09:00",
        close_time=profile.get("close_time") or "21:00",
        open_days=", ".join(open_days),
        services_line=(f"- Services: {', '.join(services)}.\n" if services else ""),
        appt_types_line=(f"- Appointment types: {', '.join(appt_types)}.\n" if appt_types else ""),
    )
    return template.format(
        business_name=profile.get("business_name") or "this business",
        shared_rules=shared,
    )


async def sarvam_stt(pcm_16k: bytes) -> str:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(PIPE_SR)
        wf.writeframes(pcm_16k)

    if not cb.sarvam_stt_breaker.allow_request():
        log.warning("sarvam_stt: circuit OPEN, skipping live call")
        return ""

    async with httpx.AsyncClient(timeout=20) as c:
        try:
            r = await c.post("https://api.sarvam.ai/speech-to-text",
                headers={"api-subscription-key": SARVAM_KEY},
                files={"file": ("audio.wav", buf.getvalue(), "audio/wav")},
                data={"language_code":"te-IN", "model":"saarika:v2.5"})
        except Exception as e:
            log.error("STT request failed: %s", e)
            cb.sarvam_stt_breaker.record_failure()
            return ""
        if r.status_code != 200:
            log.error("STT %s: %s", r.status_code, r.text[:150])
            cb.sarvam_stt_breaker.record_failure()
            return ""
        cb.sarvam_stt_breaker.record_success()
        return r.json().get("transcript", "").strip()


async def sarvam_tts(text: str, voice: str = DEFAULT_VOICE) -> bytes:
    if not cb.sarvam_tts_breaker.allow_request():
        log.warning("sarvam_tts: circuit OPEN, skipping live call")
        return b""

    async with httpx.AsyncClient(timeout=30) as c:
        try:
            r = await c.post("https://api.sarvam.ai/text-to-speech",
                headers={"api-subscription-key": SARVAM_KEY},
                json={"inputs":[text], "target_language_code":"te-IN",
                      "speaker":voice, "model":"bulbul:v2"})
        except Exception as e:
            log.error("TTS request failed: %s", e)
            cb.sarvam_tts_breaker.record_failure()
            return b""
        if r.status_code != 200:
            log.error("TTS %s: %s", r.status_code, r.text[:150])
            cb.sarvam_tts_breaker.record_failure()
            return b""
        cb.sarvam_tts_breaker.record_success()
        wav = base64.b64decode(r.json()["audios"][0])
        with wave.open(io.BytesIO(wav), "rb") as wf:
            return wf.readframes(wf.getnframes())


MAX_HISTORY_TURNS = 4  # matches the plan's own "4-turn cap" / "rolling 4-turn
                        # memory window" design — without this, s.history grows
                        # unbounded for the whole call and every turn re-sends
                        # the entire growing transcript to Gemini.


async def gemini_reply(history: list, system: str) -> str:
    # Only the last N turns go to the model — s.history itself is left
    # untouched by the caller so the full transcript is still available if
    # it's ever needed for call records later.
    trimmed = history[-(MAX_HISTORY_TURNS * 2):]
    contents = [{"role":"user" if m["role"]=="user" else "model",
                 "parts":[{"text":m["content"]}]} for m in trimmed]
    url = ("https://generativelanguage.googleapis.com/v1beta/models/"
           "gemini-2.5-flash:generateContent?key=" + GEMINI_KEY)

    if not cb.gemini_breaker.allow_request():
        log.warning("gemini_reply: circuit OPEN, skipping live call")
        return "క్షమించండి, technical issue."

    async with httpx.AsyncClient(timeout=30) as c:
        try:
            r = await c.post(url, headers={"Content-Type":"application/json"},
                json={"system_instruction":{"parts":[{"text":system}]},
                      "contents":contents,
                      "generationConfig":{"maxOutputTokens":150,"temperature":0.7}})
        except Exception as e:
            log.error("Gemini request failed: %s", e)
            cb.gemini_breaker.record_failure()
            return "క్షమించండి, technical issue."
        if r.status_code != 200:
            log.error("Gemini %s: %s", r.status_code, r.text[:200])
            cb.gemini_breaker.record_failure()
            return "క్షమించండి, technical issue."
        try:
            usage = r.json().get("usageMetadata", {})
            cached = usage.get("cachedContentTokenCount", 0)
            if cached:
                # Implicit caching (automatic on Gemini 2.5+, needs no code —
                # see MAX_HISTORY_TURNS docstring context) has started kicking
                # in, most likely once RAG context pushed a prompt past the
                # model's ~1024-token minimum. Worth knowing when it happens.
                log.info("gemini_reply: %d cached tokens (implicit caching active)", cached)
            reply = r.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
            cb.gemini_breaker.record_success()
            return reply
        except (KeyError, IndexError):
            cb.gemini_breaker.record_failure()
            return "క్షమించండి, మళ్ళీ చెప్పగలరా?"


async def lookup_voice_profile(did: str) -> Optional[dict]:
    """Real production routing: look up an active voice_profiles row by the
    number the caller dialed (`did`), NOT the caller's own number. This is
    how a provisioned client gets their own SKU/greeting/business context.
    Returns None if nothing's provisioned for that DID — callers fall back
    to lookup_tenant's demo-phone matching, which is a separate, unrelated
    flow used only for the single demo line.
    """
    if not did:
        return None
    async with httpx.AsyncClient(timeout=8) as c:
        try:
            for col in ("did_number", "exotel_did"):
                r = await c.get(f"{SUPABASE_URL}/rest/v1/voice_profiles",
                    headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
                    params={col: f"eq.{did}", "status": "eq.active",
                            "select": "id,tenant_id,profile_sku,business_name,open_time,"
                                      "close_time,open_days,services,appointment_types",
                            "limit": "1"})
                if r.status_code == 200 and r.json():
                    return r.json()[0]
        except Exception as e:
            log.warning("voice_profile lookup failed: %s", e)
    return None


async def lookup_tenant(caller: str) -> dict:
    caller_e164 = "+91" + "".join(c for c in (caller or "") if c.isdigit())[-10:]
    async with httpx.AsyncClient(timeout=8) as c:
        try:
            r = await c.get(f"{SUPABASE_URL}/rest/v1/tenants",
                headers={"apikey":SUPABASE_KEY, "Authorization":f"Bearer {SUPABASE_KEY}"},
                params={"demo_phone":f"eq.{caller_e164}", "is_demo":"eq.true",
                        "select":"id,name,business_type,greeting_text,voice_profile",
                        "limit":"1"})
            if r.status_code == 200 and r.json():
                return r.json()[0]
        except Exception as e:
            log.warning("tenant lookup failed: %s", e)
    return {"name":"Jovio Demo", "business_type":"general", "voice_profile":DEFAULT_VOICE}


# ─── Call row + recording persistence ─────────────────────
async def save_call_row(data: dict) -> Optional[str]:
    """Create a `calls` row. Returns the new row's id, or None on failure —
    never raises, a metadata-save failure must not break the live call."""
    async with httpx.AsyncClient(timeout=8) as c:
        try:
            r = await c.post(f"{SUPABASE_URL}/rest/v1/calls",
                headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
                         "Content-Type": "application/json", "Prefer": "return=representation"},
                json=data)
            if r.status_code in (200, 201) and r.json():
                return r.json()[0]["id"]
            log.warning("save_call_row %s: %s", r.status_code, r.text[:200])
        except Exception as e:
            log.warning("save_call_row failed: %s", e)
    return None


async def update_call_row(call_id: str, updates: dict):
    async with httpx.AsyncClient(timeout=8) as c:
        try:
            r = await c.patch(f"{SUPABASE_URL}/rest/v1/calls",
                headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
                         "Content-Type": "application/json"},
                params={"id": f"eq.{call_id}"}, json=updates)
            if r.status_code >= 300:
                log.warning("update_call_row %s: %s", r.status_code, r.text[:200])
        except Exception as e:
            log.warning("update_call_row failed: %s", e)


async def upload_recording_blob(path: str, blob: bytes) -> bool:
    """Upload encrypted recording bytes to Supabase Storage. Bucket name is
    configurable via SUPABASE_RECORDINGS_BUCKET (defaults to 'recordings').
    Bucket must exist and be PRIVATE — encryption is defense-in-depth, not
    a substitute for access control."""
    bucket = os.getenv("SUPABASE_RECORDINGS_BUCKET", "recordings")
    async with httpx.AsyncClient(timeout=30) as c:
        try:
            r = await c.post(f"{SUPABASE_URL}/storage/v1/object/{bucket}/{path}",
                headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
                         "Content-Type": "application/octet-stream", "x-upsert": "true"},
                content=blob)
            if r.status_code >= 300:
                log.warning("upload_recording_blob %s: %s", r.status_code, r.text[:200])
                return False
            return True
        except Exception as e:
            log.warning("upload_recording_blob failed: %s", e)
            return False


def _pcm8k_to_wav(pcm_8k: bytes) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(EXOTEL_SR)
        wf.writeframes(pcm_8k)
    return buf.getvalue()


def _encrypt_recording(wav_bytes: bytes, tenant_id: str, call_key: str) -> Optional[bytes]:
    """AES-256-GCM. Stored layout: [12-byte nonce][ciphertext + GCM tag].
    Key: JOVIO_RECORDING_KEY_<tenant_id> override if set, else the shared
    JOVIO_RECORDING_KEY. Must be a 32-byte key, base64-encoded in env."""
    if not _HAS_CRYPTO:
        log.error("cryptography not installed; skipping recording encryption")
        return None
    key_b64 = os.getenv(f"JOVIO_RECORDING_KEY_{tenant_id}") or os.getenv("JOVIO_RECORDING_KEY")
    if not key_b64:
        log.error("JOVIO_RECORDING_KEY not set; skipping recording")
        return None
    try:
        key = base64.b64decode(key_b64)
        if len(key) != 32:
            log.error("recording key must decode to 32 bytes, got %d", len(key))
            return None
        nonce = secrets.token_bytes(12)
        ciphertext = AESGCM(key).encrypt(nonce, wav_bytes, associated_data=call_key.encode())
        return nonce + ciphertext
    except Exception as e:
        log.error("recording encryption failed: %s", e)
        return None


async def finalize_call_recording(s: "Session", duration_s: int):
    """Runs after 'stop'. Encrypts + uploads the buffered call audio, then
    closes out the calls row. Never raises past this point — call teardown
    must not depend on Supabase or crypto succeeding."""
    tenant_id = s.tenant.get("id") or "unmatched"
    updates = {"status": "completed", "duration_seconds": duration_s}

    if s.recording_buf:
        try:
            wav_bytes = _pcm8k_to_wav(bytes(s.recording_buf))
            call_key = s.call_row_id or s.call_sid or "unknown"
            blob = _encrypt_recording(wav_bytes, str(tenant_id), str(call_key))
            if blob:
                path = f"recordings/{tenant_id}/{call_key}.wav.enc"
                if await upload_recording_blob(path, blob):
                    updates["recording_path"] = path
                    log.info("recording uploaded: %s (%d bytes raw -> %d bytes encrypted)",
                              path, len(wav_bytes), len(blob))
        except Exception as e:
            log.warning("finalize_call_recording: recording step failed: %s", e)
    else:
        log.info("finalize_call_recording: no audio buffered, skipping recording")

    if s.call_row_id:
        await update_call_row(s.call_row_id, updates)
    else:
        log.warning("finalize_call_recording: no call_row_id, call metadata not saved")


class Session:
    def __init__(self, ws: WebSocket):
        self.ws = ws
        self.stream_sid = None
        self.call_sid = None
        self.caller = ""
        self.did = ""
        self.tenant = {}
        self.history = []
        self._sys = ""
        self.upsample_state = None
        self.downsample_state = None
        self.speech_buf = bytearray()
        self.silence_count = 0
        self.in_speech = False
        self.speaking_back = False
        self.socket_open = True
        self.recording_buf = bytearray()
        self.call_row_id: Optional[str] = None
        self.voice_profile_id: Optional[str] = None
        self.started_at: Optional[float] = None

    async def send_pcm(self, pcm_bytes: bytes):
        """Send 16-bit PCM @ 8kHz to Exotel Voicebot in 3200-byte (100ms) chunks."""
        FRAME = 3200  # 100ms of 16-bit @ 8kHz per Exotel docs
        for i in range(0, len(pcm_bytes), FRAME):
            if not self.socket_open:
                return
            chunk = pcm_bytes[i:i+FRAME]
            if len(chunk) < FRAME:
                chunk = chunk + b"\x00" * (FRAME - len(chunk))
            try:
                await self.ws.send_text(json.dumps({
                    "event":"media",
                    "stream_sid": self.stream_sid,
                    "media": {"payload": base64.b64encode(chunk).decode()},
                }))
            except Exception as e:
                log.info("send_pcm stopped: %s", e)
                self.socket_open = False
                return
            await asyncio.sleep(0.095)  # 100ms pacing

    async def play_cached(self, key: str = "default"):
        path = os.path.join(CACHED_DIR, f"{key}.pcm")
        if not os.path.exists(path):
            log.error("no cached greeting at %s", path)
            path = os.path.join(CACHED_DIR, "default.pcm")
            if not os.path.exists(path):
                return
        self.speaking_back = True
        try:
            pcm = open(path, "rb").read()  # raw 16-bit PCM @ 8kHz, despite old var name below
            log.info("play_cached %s: %d bytes", key, len(pcm))
            self.recording_buf.extend(pcm)
            await self.send_pcm(pcm)
            log.info("play_cached done")
        finally:
            self.speaking_back = False

    async def speak_dynamic(self, text: str):
        if not text:
            return
        try:
            log.info("speak_dynamic: %s", text[:60])
            pcm_22k = await sarvam_tts(text, self.tenant.get("voice_profile", DEFAULT_VOICE))
            if not pcm_22k:
                # Live TTS failed (or the circuit breaker skipped it entirely) —
                # caller should hear SOMETHING, not dead air. Falls back to a
                # pre-cached clip that needs no live Sarvam call to play.
                log.warning("speak_dynamic: TTS unavailable, playing cached fallback")
                await self.play_cached("technical_difficulty")
                return
            pcm_8k, self.downsample_state = audioop.ratecv(
                pcm_22k, 2, 1, TTS_SR, EXOTEL_SR, self.downsample_state)
            self.speaking_back = True
            try:
                self.recording_buf.extend(pcm_8k)
                await self.send_pcm(pcm_8k)  # Send raw PCM, not mu-law
            finally:
                self.speaking_back = False
        except Exception as e:
            log.warning("speak_dynamic failed: %s", e)

    def feed_caller_audio(self, pcm_16k: bytes):
        if self.speaking_back:
            return None
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
                    utt = bytes(self.speech_buf)
                    self.speech_buf = bytearray()
                    return utt
        return None


async def handle_exotel_ws(ws: WebSocket):
    log.info("INCOMING WS attempt")
    await ws.accept()
    s = Session(ws)
    log.info("WS accepted")

    try:
        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue
            ev = msg.get("event")

            if ev == "connected":
                log.info("connected")

            elif ev == "start":
                start = msg.get("start", {})
                s.stream_sid = msg.get("stream_sid") or start.get("stream_sid")
                s.call_sid = start.get("call_sid", "")
                cp = start.get("custom_parameters") or {}
                s.caller = cp.get("From") or start.get("from") or ""
                s.did    = cp.get("To")   or start.get("to")   or ""
                s.started_at = time.time()
                log.info("start call=%s from=%s to=%s", s.call_sid, s.caller, s.did)
                asyncio.create_task(s.play_cached("default"))
                async def _setup():
                    vp = await lookup_voice_profile(s.did)
                    if vp:
                        s.tenant = {
                            "id": vp.get("tenant_id"),
                            "name": vp.get("business_name") or "Jovio Client",
                            "voice_profile": SKU_VOICE.get(
                                vp.get("profile_sku") or "standard", DEFAULT_VOICE),
                        }
                        s.voice_profile_id = vp.get("id")
                        s._sys = build_sku_prompt(vp)
                        log.info("voice profile matched: sku=%s business=%s",
                                 vp.get("profile_sku"), vp.get("business_name"))
                    else:
                        s.tenant = await lookup_tenant(s.caller)
                        s._sys = SYSTEM_PROMPT.format(
                            business_type=s.tenant.get("business_type","general"),
                            business_name=s.tenant.get("name","this business"))
                        log.info("tenant ready (demo fallback): %s", s.tenant.get("name"))
                    s.call_row_id = await save_call_row({
                        "tenant_id": s.tenant.get("id"),
                        "caller_number": s.caller,
                        "direction": "inbound",
                        "status": "active",
                        "exotel_call_sid": s.call_sid,
                    })
                    if s.call_row_id:
                        log.info("call row created: %s", s.call_row_id)
                asyncio.create_task(_setup())

            elif ev == "media":
                payload = msg.get("media", {}).get("payload", "")
                if not payload:
                    continue
                pcm_8k = base64.b64decode(payload)
                s.recording_buf.extend(pcm_8k)
                pcm_16k, s.upsample_state = audioop.ratecv(
                    pcm_8k, 2, 1, EXOTEL_SR, PIPE_SR, s.upsample_state)
                utt = s.feed_caller_audio(pcm_16k)
                if utt is not None:
                    asyncio.create_task(_handle_utterance(s, utt))

            elif ev == "stop":
                log.info("stop call=%s", s.call_sid)
                s.socket_open = False
                duration = int(time.time() - s.started_at) if s.started_at else 0
                asyncio.create_task(finalize_call_recording(s, duration))
                break

    except WebSocketDisconnect:
        log.info("ws disconnect")
    except RuntimeError as e:
        if "not connected" in str(e) or "after sending" in str(e):
            log.info("ws closed: %s", e)
        else:
            log.exception("runtime: %s", e)
    except Exception as e:
        log.exception("handler: %s", e)
    finally:
        s.socket_open = False


async def _handle_utterance(s: Session, pcm: bytes):
    try:
        text = await sarvam_stt(pcm)
        if not text:
            return
        log.info("caller: %s", text)
        s.history.append({"role":"user","content":text})

        # RAG: only runs when a real voice_profile is provisioned (demo
        # fallback has none, so this is a no-op there). A failure at any
        # step inside retrieve_context just means no extra context for
        # this turn — never blocks or delays the call beyond the lookup.
        sys_for_turn = s._sys
        if s.voice_profile_id:
            snippets = await knowledge.retrieve_context(s.voice_profile_id, text)
            if snippets:
                log.info("knowledge base: %d snippet(s) matched", len(snippets))
                sys_for_turn = knowledge.augment_prompt(s._sys, snippets)

        reply = await gemini_reply(s.history, sys_for_turn)
        log.info("ai: %s", reply)
        s.history.append({"role":"assistant","content":reply})
        await s.speak_dynamic(reply)
    except Exception as e:
        log.exception("utterance failed: %s", e)
