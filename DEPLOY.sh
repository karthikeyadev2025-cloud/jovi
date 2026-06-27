# Jovio — Deployment Guide
# Run these commands in order. Everything deploys in ~30 minutes.

# ══════════════════════════════════════
# STEP 1: SUPABASE DATABASE (5 min)
# ══════════════════════════════════════
# 1. Go to: https://supabase.com/dashboard
# 2. Open your jovio project
# 3. SQL Editor → New Query
# 4. Paste contents of supabase/001_schema.sql
# 5. Click RUN → should say "Success"
# 6. Go to Settings → API → copy these 3 values:
#    - Project URL
#    - anon public key
#    - service_role secret key

# ══════════════════════════════════════
# STEP 2: VOICE PIPELINE — Railway (10 min)
# ══════════════════════════════════════
# 1. Go to: https://railway.app → New Project
# 2. Deploy from GitHub → select your repo → select /voice-pipeline folder
# 3. Add ALL environment variables from .env.example (fill in your real values)
# 4. Deploy → wait ~3 min → get URL like: https://jovio-pipeline.up.railway.app
# 5. Test: curl https://jovio-pipeline.up.railway.app/health
#    Should return: {"status":"ok","service":"jovio-voice-pipeline"}

# ══════════════════════════════════════
# STEP 3: MARKETING WEBSITE — Vercel (5 min)
# ══════════════════════════════════════

# Create Next.js app:
npx create-next-app@latest jovio-web --typescript --tailwind --app --no-src-dir --no-import-alias
cd jovio-web

# Copy our page.tsx:
cp ../web/page.tsx app/page.tsx

# Add environment variables to .env.local:
echo "NEXT_PUBLIC_SUPABASE_URL=https://YOUR.supabase.co" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key" >> .env.local

# Test locally:
npm run dev
# Opens at http://localhost:3000 — verify it looks good

# Deploy to Vercel:
npm i -g vercel
vercel --prod
# Follow prompts → get URL like: https://jovio.vercel.app

# Custom domain (if you bought jovio.in):
# Vercel dashboard → your project → Settings → Domains → Add jovio.in

# ══════════════════════════════════════
# STEP 4: DASHBOARD — Vercel (10 min)
# ══════════════════════════════════════

# Create from our dashboard folder:
cd ../dashboard
npm install
cp .env.example .env.local
# Fill in .env.local with your Supabase values

# Test locally:
npm run dev -- --port 3001
# Opens at http://localhost:3001

# Enable Google OAuth in Supabase (for "Continue with Google" button):
# Supabase → Authentication → Providers → Google → Enable
# Add your Google OAuth client ID + secret
# Add redirect URL: https://YOUR.supabase.co/auth/v1/callback

# Deploy dashboard to Vercel:
vercel --prod
# Add env vars in Vercel dashboard → Settings → Environment Variables:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   NEXT_PUBLIC_RAZORPAY_KEY_ID (get from Razorpay dashboard)

# ══════════════════════════════════════
# STEP 5: CONNECT EXOTEL (15 min)
# ══════════════════════════════════════
# Exotel takes 24-48h to activate, so do this first

# 1. Login to Exotel dashboard
# 2. ExoPhone → your DID number → Settings
# 3. Set App Type: Connector
# 4. Connector: Custom
# 5. URL: https://jovio-pipeline.up.railway.app/api/v1/call/inbound
# 6. Method: POST
# 7. Add custom header:
#    X-Internal-Secret: (your INTERNAL_SECRET value from .env)
# 8. Save

# Test: Call your Exotel DID number from any phone
# Should hear Telugu TRAI disclosure within 2-3 seconds

# ══════════════════════════════════════
# STEP 6: WHATSAPP (optional for presentation)
# ══════════════════════════════════════
# 1. Go to: wati.io → Sign up (free trial)
# 2. Connect your WhatsApp Business number
# 3. Get API key + URL
# 4. Add to Railway env vars:
#    WATI_API_KEY=your_key
#    WATI_API_URL=https://live-mt-server.wati.io/YOUR_ACCOUNT_ID

# ══════════════════════════════════════
# VERIFICATION CHECKLIST
# ══════════════════════════════════════
# [ ] Supabase schema runs without errors
# [ ] curl https://pipeline-url/health returns {"status":"ok"}
# [ ] Marketing website loads at your Vercel URL
# [ ] Dashboard login page works
# [ ] Sign up creates account and redirects to dashboard
# [ ] Call your Exotel number → AI answers in Telugu
# [ ] Say "appointment కావాలి" → AI asks for time
# [ ] WhatsApp confirmation arrives (if Wati configured)
# [ ] Reception log shows the call in dashboard

# ══════════════════════════════════════
# PRESENTATION DEMO SCRIPT (2 min)
# ══════════════════════════════════════
# 1. Show marketing website → live call counter ticking up
# 2. Show signup → takes 30 seconds
# 3. Show Setup page → pick "Clinic", fill form, save
# 4. CALL your Exotel number live during presentation
#    → Say: "హలో, నాకు రేపు appointment కావాలి"
#    → AI books it in Telugu
#    → WhatsApp message arrives on your phone
# 5. Show Reception Log → call appears with "appointment" badge
# 6. Show Analytics → chart shows the call
# 7. Show Billing → 3 plan cards

# ══════════════════════════════════════
# IF EXOTEL NOT READY — BACKUP PLAN
# ══════════════════════════════════════
# Pre-record a Telugu call audio and play it during presentation:
#   python -c "
#   import asyncio, httpx, base64
#   async def test():
#       async with httpx.AsyncClient() as c:
#           r = await c.post('https://api.sarvam.ai/text-to-speech',
#               headers={'api-subscription-key':'YOUR_KEY'},
#               json={'inputs':['నమస్కారం! మీ appointment confirm అయింది. ధన్యవాదాలు!'],
#                     'target_language_code':'te-IN','speaker':'meera','model':'bulbul:v3'})
#           audio = base64.b64decode(r.json()['audios'][0])
#           open('demo.wav','wb').write(audio)
#   asyncio.run(test())
#   "
# Then play demo.wav during presentation
