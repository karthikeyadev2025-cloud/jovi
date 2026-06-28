# voice-pipeline assets

This directory contains pre-recorded audio assets loaded at call start.

## TRAI disclosure WAVs

The TRAI mandatory AI-disclosure is pre-recorded per voice profile to:
- Save ~500ms of TTS latency per inbound call
- Cut TTS spend (identical text on every call = pure waste)
- Provide auditable compliance evidence (recorded once, never modified)

Generate them with:
```
python3 voice-pipeline/scripts/generate_trai_disclosure.py
```

Expected files after running the script:
- `trai_disclosure_meera.wav`     — standard / premium profiles
- `trai_disclosure_pavithra.wav`  — clinic profiles
- `trai_disclosure_arvind.wav`    — real-estate profiles

If a WAV is missing, `main.py` falls back to runtime TTS synthesis
(slower, costs Sarvam credits — fine for dev, avoid in prod).
