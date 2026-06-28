"""
Pre-generate the TRAI mandatory AI-disclosure WAV via Sarvam Bulbul TTS.
Run this ONCE per deployment. Output goes to voice-pipeline/assets/trai_disclosure.wav
and is loaded at call-start instead of being re-synthesized every call.

Why pre-gen:
  - Saves ~400-600ms of TTS latency on every inbound call (better UX)
  - Cuts Sarvam TTS spend by ~30% (every call hits this line, identical text)
  - Disclosure audio is identical for every tenant — pure waste to regenerate
  - Compliance: pre-recorded audio is auditable; we can prove what's played

Usage:
  cd voice-pipeline && python3 scripts/generate_trai_disclosure.py
"""
import os, sys, asyncio, httpx, pathlib

SARVAM_KEY = os.getenv("SARVAM_API_KEY")
if not SARVAM_KEY:
    sys.exit("ERROR: SARVAM_API_KEY not set. Add it to .env first.")

# The mandatory TRAI disclosure — Telugu first, with code-switched
# English nouns (matches Indian SMB caller expectation per TRAI guidance).
DISCLOSURE_TEXT = (
    "నమస్కారం. ఈ call ఒక automated AI assistant ద్వారా handle అవుతోంది. "
    "మీరు ఏ సమయంలో అయినా 'human' అని చెబితే మన staff కి transfer చేస్తాను."
)

# Voice options — record one per voice profile so each business's
# disclosure matches their selected speaker.
VOICES = ["meera", "pavithra", "arvind"]

ASSETS_DIR = pathlib.Path(__file__).resolve().parent.parent / "assets"
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

async def synthesize(voice: str) -> bytes:
    """Hit Sarvam Bulbul V3 8kHz (telephony native) for the WAV bytes."""
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            "https://api.sarvam.ai/text-to-speech",
            headers={"api-subscription-key": SARVAM_KEY},
            json={
                "inputs":          [DISCLOSURE_TEXT],
                "target_language_code": "te-IN",
                "speaker":         voice,
                "model":           "bulbul:v3",
                "sample_rate":     8000,        # telephony native
                "speech_sample_rate": 8000,
                "enable_preprocessing": True,
            },
        )
        r.raise_for_status()
        # Sarvam returns base64-encoded audios array
        import base64
        return base64.b64decode(r.json()["audios"][0])

async def main():
    print(f"Generating TRAI disclosure for {len(VOICES)} voices…")
    for voice in VOICES:
        try:
            wav = await synthesize(voice)
            out = ASSETS_DIR / f"trai_disclosure_{voice}.wav"
            out.write_bytes(wav)
            print(f"  ✓ {out.name}  ({len(wav):,} bytes)")
        except Exception as e:
            print(f"  ✗ {voice}: {e}", file=sys.stderr)
            sys.exit(1)
    print(f"\nDone. Files in {ASSETS_DIR}")
    print("Commit these WAVs to the repo — they're static brand assets.")

if __name__ == "__main__":
    asyncio.run(main())
