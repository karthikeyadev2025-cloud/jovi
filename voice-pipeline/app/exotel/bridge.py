"""
Exotel <-> Jovio voice bridge.

Exotel's "Voicebot" / "Stream" applet opens a WebSocket connection to us and
sends bidirectional audio in 8kHz mu-law base64. We translate that to/from
our internal pipeline (Sarvam STT in -> LLM -> Sarvam TTS out).

Exotel protocol reference:
  https://developer.exotel.com/api/voicebot-applet

Message types we handle:
  - "connected"  : websocket established, no data yet
  - "start"      : call metadata (CallSid, From, To)
  - "media"      : base64-encoded mu-law audio frames (~20ms each)
  - "stop"       : call ended

Messages we send back:
  - "media"      : base64-encoded mu-law audio chunks to play
  - "mark"       : optional checkpoints (we use these to know when TTS finished)
  - "clear"      : interrupt current playback (when user speaks over TTS)
"""
import asyncio, base64, json, audioop, logging, os, time
from typing import Optional
from fastapi import WebSocket, WebSocketDisconnect

log = logging.getLogger("exotel-bridge")

# Sarvam expects 16kHz PCM, Exotel gives us 8kHz mu-law.
# Conversion: mu-law -> linear PCM -> upsample 8k to 16k.
EXOTEL_SAMPLE_RATE = 8000
PIPELINE_SAMPLE_RATE = 16000

class ExotelSession:
    """One per call. Tracks audio buffer, STT/TTS handles, conversation state."""

    def __init__(self, ws: WebSocket):
        self.ws = ws
        self.call_sid: Optional[str] = None
        self.caller_number: Optional[str] = None
        self.did_number: Optional[str] = None
        self.tenant_id: Optional[str] = None
        self.stream_sid: Optional[str] = None
        self.started_at = time.time()
        self.audio_buffer = bytearray()  # accumulates PCM until VAD says speech ended
        self._upsample_state = None  # audioop ratecv state

    async def send_audio(self, pcm_16k_bytes: bytes):
        """Send PCM audio back to Exotel as 8kHz mu-law base64."""
        # Downsample 16k -> 8k
        pcm_8k, self._upsample_state = audioop.ratecv(
            pcm_16k_bytes, 2, 1, PIPELINE_SAMPLE_RATE, EXOTEL_SAMPLE_RATE, None
        )
        # Linear PCM -> mu-law
        mulaw = audioop.lin2ulaw(pcm_8k, 2)
        b64 = base64.b64encode(mulaw).decode()
        await self.ws.send_json({
            "event": "media",
            "stream_sid": self.stream_sid,
            "media": {"payload": b64},
        })

    async def send_mark(self, name: str):
        """Mark a checkpoint — Exotel will echo this back when reached."""
        await self.ws.send_json({
            "event": "mark",
            "stream_sid": self.stream_sid,
            "mark": {"name": name},
        })

    async def clear(self):
        """Cancel any audio queued on Exotel's side (barge-in)."""
        await self.ws.send_json({"event": "clear", "stream_sid": self.stream_sid})


async def handle_exotel_ws(ws: WebSocket):
    """
    Main entrypoint. Called by FastAPI route `/ws/exotel`.
    Spawned per incoming Exotel call.
    """
    await ws.accept()
    session = ExotelSession(ws)
    log.info("Exotel WS accepted")

    try:
        async for raw in _iter_json(ws):
            event = raw.get("event")

            if event == "connected":
                log.info("connected: %s", raw)

            elif event == "start":
                start = raw.get("start", {})
                session.call_sid = start.get("call_sid")
                session.stream_sid = start.get("stream_sid") or raw.get("stream_sid")
                custom = start.get("custom_parameters") or {}
                session.caller_number = custom.get("From") or start.get("from")
                session.did_number    = custom.get("To")   or start.get("to")
                log.info("start: call=%s from=%s to=%s",
                         session.call_sid, session.caller_number, session.did_number)
                # Greet the caller with TRAI disclosure first, then start LLM loop
                asyncio.create_task(_start_call(session))

            elif event == "media":
                payload = raw["media"]["payload"]
                mulaw   = base64.b64decode(payload)
                pcm_8k  = audioop.ulaw2lin(mulaw, 2)
                pcm_16k, session._upsample_state = audioop.ratecv(
                    pcm_8k, 2, 1, EXOTEL_SAMPLE_RATE, PIPELINE_SAMPLE_RATE,
                    session._upsample_state,
                )
                session.audio_buffer.extend(pcm_16k)
                # TODO: chunk into VAD-detected utterances, send to Sarvam STT

            elif event == "stop":
                log.info("stop: call=%s duration=%.1fs",
                         session.call_sid, time.time() - session.started_at)
                break

            elif event == "mark":
                log.debug("mark reached: %s", raw.get("mark", {}).get("name"))

            else:
                log.debug("unhandled event: %s", event)

    except WebSocketDisconnect:
        log.info("Exotel WS disconnected")
    except Exception as e:
        log.exception("Exotel WS error: %s", e)


async def _iter_json(ws: WebSocket):
    while True:
        msg = await ws.receive_text()
        try:
            yield json.loads(msg)
        except json.JSONDecodeError:
            log.warning("Bad JSON from Exotel: %s", msg[:100])


async def _start_call(session: ExotelSession):
    """
    Once Exotel says 'start', play TRAI disclosure then hand off to LLM agent.
    For now (Phase 1), just stream the pre-recorded TRAI WAV back to caller.
    Phase 2 will wire in the actual Sarvam STT -> Anthropic -> Sarvam TTS loop.
    """
    try:
        # Locate TRAI WAV for this tenant's voice (default to anushka)
        voice = "anushka"  # TODO: resolve from tenant lookup
        trai_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "assets", f"trai_disclosure_{voice}.wav"
        )
        if not os.path.exists(trai_path):
            log.error("TRAI WAV missing: %s", trai_path)
            return
        # Read + convert WAV to raw 16kHz PCM
        import wave
        with wave.open(trai_path, "rb") as wf:
            sr = wf.getframerate()
            frames = wf.readframes(wf.getnframes())
        if sr != PIPELINE_SAMPLE_RATE:
            # Upsample if WAV is at a different rate
            frames, _ = audioop.ratecv(frames, 2, 1, sr, PIPELINE_SAMPLE_RATE, None)
        # Send in ~200ms chunks so it streams smoothly
        CHUNK = PIPELINE_SAMPLE_RATE * 2 // 5  # 200ms of 16-bit @ 16kHz
        for i in range(0, len(frames), CHUNK):
            await session.send_audio(frames[i:i + CHUNK])
            await asyncio.sleep(0.18)  # slight pacing
        await session.send_mark("disclosure_done")
        log.info("TRAI disclosure played for %s", session.call_sid)
    except Exception as e:
        log.exception("_start_call failed: %s", e)
