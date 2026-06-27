# K² Vob — Telugu AI Receptionist SaaS

> Your business never misses a call. Telugu AI receptionist that books appointments, sends WhatsApp confirmations, and handles every inbound call — automatically.

## Project Structure

```
k2vob/
├── voice-pipeline/     # Python FastAPI — Sarvam STT/TTS + Gemini LLM + LiveKit
├── api-server/         # Node.js — Webhooks, Razorpay, WhatsApp, Tenant APIs
├── dashboard/          # Next.js — Customer web dashboard
├── super-admin/        # Next.js — Super admin control panel
├── web/                # Next.js — Marketing website
├── flutter-app/        # Flutter — iOS + Android customer app
└── supabase/           # SQL schema + migrations
```

## Quick Start

### 1. Database
```bash
# Open Supabase SQL Editor → paste and run:
supabase/001_schema.sql
```

### 2. Voice Pipeline
```bash
cd voice-pipeline
pip install -r requirements.txt
cp .env.example .env   # fill in your keys
python main.py
```

### 3. API Server
```bash
cd api-server
npm install
cp .env.example .env   # fill in your keys
npm run dev
```

### 4. Dashboard
```bash
cd dashboard
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

### 5. Flutter App
```bash
cd flutter-app
flutter pub get
flutter run
```

## Environment Variables
Copy `.env.example` to `.env` in each folder and fill in your values.
**Never commit `.env` files with real keys.**

## Tech Stack
- **Voice**: Sarvam Saaras V3 (STT) + Sarvam Bulbul V3 (TTS) + Gemini 2.5 Flash (LLM)
- **Orchestration**: LiveKit Agents (self-hosted, AWS Mumbai)
- **Telephony**: Exotel AgentStream (inbound) + Plivo (outbound campaigns)
- **Database**: Supabase (PostgreSQL + RLS)
- **Payments**: Razorpay (subscriptions + add-ons)
- **WhatsApp**: Wati / 360dialog
- **Frontend**: Next.js 14 + Tailwind CSS
- **Mobile**: Flutter 3.x (iOS + Android)
- **Deployment**: Vercel (web) + AWS Mumbai (pipeline)

## Architecture
```
Caller → Exotel AgentStream → LiveKit → Sarvam STT → Gemini → Sarvam TTS → Caller
                                                    ↓
                                          Supabase (transcript, appointment)
                                                    ↓
                                          WhatsApp confirmation (Wati)
```

## Built by K2 Adexos Global Technologies
