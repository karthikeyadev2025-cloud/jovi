// Jovio — Marketing Website (app/page.tsx)
// Telugu AI Receptionist · Powered by Jovio Tech Labs
"use client";
import { useState, useEffect, useRef } from "react";

const B = {
  bg:     "#07070F",
  surf:   "#0D0D1A",
  hi:     "#13132A",
  bord:   "#1E1E3A",
  // Jovio brand colors from logo
  orange: "#F97316",
  teal:   "#10B981",
  grad:   "linear-gradient(135deg, #F97316, #10B981)",
  gradR:  "linear-gradient(135deg, #10B981, #F97316)",
  txt:    "#F0F0FF",
  mid:    "#9090B0",
  dim:    "#44445A",
};

// ── Jovio Logo SVG (matches the J logo style) ─────────
function JovioLogo({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/jovio-logo.jpg"
      alt="Jovio"
      style={{ width: size, height: size, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
      onError={(e) => {
        // Fallback SVG if image not found
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

function LiveCounter() {
  const [n, setN] = useState(1847);
  useEffect(() => {
    const t = setInterval(() => setN(c => c + Math.floor(Math.random() * 3)), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: B.hi, border: `1px solid ${B.bord}`,
      borderRadius: 20, padding: "7px 16px", fontSize: 13, color: B.mid,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: B.teal,
        boxShadow: `0 0 8px ${B.teal}`, flexShrink: 0, animation: "pulse 2s infinite" }} />
      <span style={{ color: B.teal, fontWeight: 700 }}>{n.toLocaleString()}</span>
      <span>calls handled today</span>
    </div>
  );
}

function DemoPlayer() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const conv = [
    { r: "caller", t: "హలో, నాకు రేపు appointment కావాలి" },
    { r: "jovio",  t: "నమస్కారం! రేపు మీకు ఏ time convenient?" },
    { r: "caller", t: "Morning 10 గంటలకి possible అవుతుందా?" },
    { r: "jovio",  t: "పదింటికి slot available ఉంది. మీ పేరు చెప్పగలరా?" },
    { r: "caller", t: "రమేష్ కుమార్" },
    { r: "jovio",  t: "రమేష్ గారు, రేపు 10am confirm అయింది. WhatsApp వస్తుంది! ✓" },
  ];

  const play = () => {
    if (playing) { setPlaying(false); if (ref.current) clearInterval(ref.current); return; }
    setPlaying(true); setStep(0);
    let i = 0;
    ref.current = setInterval(() => {
      i++;
      setStep(i);
      if (i >= conv.length) { setPlaying(false); if (ref.current) clearInterval(ref.current); }
    }, 2000);
  };

  return (
    <div style={{ background: B.surf, border: `1px solid ${B.bord}`, borderRadius: 16, padding: 20, maxWidth: 480, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ color: B.mid, fontSize: 12 }}>Live Telugu Demo Call</span>
        <span style={{ background: `${B.teal}22`, color: B.teal, border: `1px solid ${B.teal}44`,
          borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 800 }}>LIVE EXAMPLE</span>
      </div>
      <div style={{ minHeight: 200, marginBottom: 16 }}>
        {conv.slice(0, step).map((line, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10,
            justifyContent: line.r === "jovio" ? "flex-start" : "flex-end" }}>
            {line.r === "jovio" && (
              <div style={{ width: 30, height: 30, borderRadius: "50%",
                background: B.grad, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 14, flexShrink: 0 }}>J</div>
            )}
            <div style={{
              background: line.r === "jovio" ? B.hi : `${B.orange}18`,
              border: `1px solid ${line.r === "jovio" ? B.bord : B.orange + "44"}`,
              borderRadius: 10, padding: "8px 12px", maxWidth: "75%",
            }}>
              <div style={{ color: B.txt, fontSize: 13, lineHeight: 1.5 }}>{line.t}</div>
            </div>
            {line.r === "caller" && (
              <div style={{ width: 30, height: 30, borderRadius: "50%",
                background: B.hi, border: `1px solid ${B.bord}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, flexShrink: 0 }}>👤</div>
            )}
          </div>
        ))}
        {step === 0 && !playing && (
          <div style={{ textAlign: "center", color: B.dim, fontSize: 12, paddingTop: 60 }}>
            Press play to see a live Telugu conversation
          </div>
        )}
      </div>
      <div style={{ height: 2, background: B.bord, borderRadius: 2, marginBottom: 12 }}>
        <div style={{ height: "100%", borderRadius: 2,
          background: B.grad,
          width: `${(step / conv.length) * 100}%`, transition: "width 0.3s" }} />
      </div>
      <button onClick={play} style={{
        width: "100%", borderRadius: 10, padding: "11px 0", fontSize: 13, fontWeight: 700,
        border: "none", cursor: "pointer",
        background: playing ? `${B.teal}22` : B.grad,
        color: playing ? B.teal : "#fff",
      }}>
        {playing ? "⏸ Playing..." : step >= conv.length ? "▶ Replay" : "▶ Play Telugu Demo"}
      </button>
    </div>
  );
}

export default function JovioHomePage() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    { name: "Starter", price: annual ? 1599 : 1999, mins: 200, profiles: 1, nums: 1, color: B.mid },
    { name: "Growth",  price: annual ? 3999 : 4999, mins: 600, profiles: 3, nums: 3, color: B.teal, pop: true },
    { name: "Scale",   price: annual ? 7999 : 9999, mins: 1500,profiles: 10,nums: 10,color: B.orange },
  ];

  const features = [
    { icon: "📞", t: "Answers Every Call", d: "Picks up in 2 rings, 24/7. Never misses a lead — even at 2am." },
    { icon: "🗣️", t: "Native Telugu AI",   d: "Understands Tanglish, regional accents, and code-switching naturally." },
    { icon: "📅", t: "Books Appointments", d: "Understands Telugu dates and times. Confirms instantly." },
    { icon: "💬", t: "WhatsApp Automation",d: "Sends confirmation, reminders, missed call replies automatically." },
    { icon: "📊", t: "Deep Audit Reports", d: "Call journey maps, recordings, transcripts, intent scores." },
    { icon: "👤", t: "Human Transfer",     d: "One word and the call transfers to your staff with full context." },
  ];

  const usecases = [
    { icon: "🏥", n: "Clinics & Hospitals",  d: "Book patient appointments 24/7 in Telugu. Handle missed calls." },
    { icon: "🏗️", n: "Real Estate",          d: "Capture leads, book site visits, never miss a hot caller." },
    { icon: "📚", n: "Coaching Institutes",  d: "Handle admissions, book counselling sessions automatically." },
    { icon: "🛒", n: "Retail & Business",    d: "Answer enquiries, take orders, handle complaints in Telugu." },
  ];

  return (
    <div style={{ background: B.bg, minHeight: "100vh", color: B.txt,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        *{box-sizing:border-box;margin:0;padding:0}
        a{color:inherit;text-decoration:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#2E2E50;border-radius:4px}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `${B.surf}EE`, backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${B.bord}`, padding: "0 24px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex",
          justifyContent: "space-between", alignItems: "center", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <JovioLogo size={36} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: "-0.02em",
                background: B.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Jovio
              </div>
              <div style={{ fontSize: 9, color: B.dim, letterSpacing: "0.1em",
                textTransform: "uppercase", marginTop: -2 }}>
                Tech Labs
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {["Features","Pricing"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{ color: B.mid, fontSize: 13 }}>{l}</a>
            ))}
            <a href="/login" style={{ color: B.mid, fontSize: 13 }}>Login</a>
            <a href="/signup" style={{
              background: B.grad, color: "#fff", borderRadius: 8,
              padding: "9px 18px", fontSize: 13, fontWeight: 700,
            }}>Start Free Trial</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: "90px 24px 70px", textAlign: "center", maxWidth: 820, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}><LiveCounter /></div>

        <h1 style={{ fontSize: "clamp(28px,5vw,54px)", fontWeight: 900,
          letterSpacing: "-0.03em", lineHeight: 1.12, marginBottom: 18 }}>
          Your Business Gets a{" "}
          <span style={{ background: B.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Telugu AI Receptionist
          </span>
          {" "}That Never Sleeps
        </h1>

        <p style={{ fontSize: 16, color: B.mid, lineHeight: 1.75, marginBottom: 36,
          maxWidth: 560, margin: "0 auto 36px" }}>
          Upload your number. Pick a voice profile. Go live in 60 seconds.
          Jovio answers every call in Telugu, books appointments, and sends
          WhatsApp confirmations — fully automated.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 52 }}>
          <a href="/signup" style={{ background: B.grad, color: "#fff", borderRadius: 12,
            padding: "15px 32px", fontSize: 15, fontWeight: 800 }}>
            Start Free 14-Day Trial
          </a>
          <a href="#demo" style={{ background: "transparent", color: B.teal,
            border: `1px solid ${B.teal}55`, borderRadius: 12,
            padding: "15px 32px", fontSize: 15, fontWeight: 700 }}>
            Watch Demo ↓
          </a>
        </div>

        {/* Stat strip */}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap",
          background: B.surf, border: `1px solid ${B.bord}`, borderRadius: 14,
          padding: "6px 0", gap: 0 }}>
          {[
            { v: "<700ms", l: "Response Time" },
            { v: "₹3.28",  l: "Cost per Minute" },
            { v: "4 SKUs", l: "Voice Profiles" },
            { v: "Telugu", l: "Native AI" },
          ].map(s => (
            <div key={s.v} style={{ textAlign: "center", padding: "14px 28px" }}>
              <div style={{ fontSize: 22, fontWeight: 900,
                background: B.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {s.v}
              </div>
              <div style={{ fontSize: 10, color: B.dim, textTransform: "uppercase",
                letterSpacing: "0.08em", marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO ── */}
      <section id="demo" style={{ padding: "60px 24px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ color: B.teal, fontSize: 11, fontWeight: 800,
            letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Live Demo</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>
            Hear Jovio Handle a Real Telugu Call
          </h2>
          <p style={{ color: B.mid, fontSize: 13 }}>
            Appointment booking in Telugu — under 700ms, zero setup required.
          </p>
        </div>
        <DemoPlayer />
      </section>

      {/* ── USE CASES ── */}
      <section style={{ padding: "60px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ color: B.teal, fontSize: 11, fontWeight: 800,
            letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Built For</div>
          <h2 style={{ fontSize: 26, fontWeight: 900 }}>Telugu Businesses Across Every Vertical</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          {usecases.map(u => (
            <div key={u.n} style={{ background: B.surf, border: `1px solid ${B.bord}`,
              borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{u.icon}</div>
              <div style={{ color: B.txt, fontSize: 13, fontWeight: 800, marginBottom: 6 }}>{u.n}</div>
              <div style={{ color: B.mid, fontSize: 12, lineHeight: 1.6 }}>{u.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "60px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ color: B.teal, fontSize: 11, fontWeight: 800,
            letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Features</div>
          <h2 style={{ fontSize: 26, fontWeight: 900 }}>Everything Your Receptionist Does — Automated</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          {features.map(f => (
            <div key={f.t} style={{ background: B.surf, border: `1px solid ${B.bord}`,
              borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ color: B.txt, fontSize: 13, fontWeight: 800, marginBottom: 6 }}>{f.t}</div>
              <div style={{ color: B.mid, fontSize: 12, lineHeight: 1.6 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "60px 24px", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ color: B.teal, fontSize: 11, fontWeight: 800,
            letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Setup</div>
          <h2 style={{ fontSize: 26, fontWeight: 900 }}>Live in Under 60 Seconds</h2>
        </div>
        {[
          ["01","Upload Your Number","Paste your existing business phone number. Jovio assigns a Telugu AI line."],
          ["02","Pick a Voice Profile","Clinic / Real Estate / Standard / Premium. One dropdown. Done."],
          ["03","Fill Business Form","Business name, hours, services. 60 seconds total."],
          ["04","Go Live","Your Jovio AI receptionist is live. First call handled automatically."],
        ].map(([n,t,d]) => (
          <div key={n} style={{ display: "flex", gap: 16, marginBottom: 18, alignItems: "flex-start" }}>
            <div style={{ background: B.grad, borderRadius: 8, padding: "4px 10px",
              fontSize: 11, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{n}</div>
            <div>
              <div style={{ color: B.txt, fontSize: 13, fontWeight: 700 }}>{t}</div>
              <div style={{ color: B.mid, fontSize: 12, marginTop: 3 }}>{d}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "60px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ color: B.teal, fontSize: 11, fontWeight: 800,
            letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Pricing</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 14 }}>Simple, Transparent Pricing</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
            <span style={{ color: B.mid, fontSize: 13 }}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} style={{
              width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
              background: annual ? B.teal : B.bord, position: "relative",
            }}>
              <span style={{
                position: "absolute", top: 2, left: annual ? 22 : 2,
                width: 20, height: 20, borderRadius: "50%", background: "#fff",
                transition: "left 0.2s",
              }} />
            </button>
            <span style={{ color: B.mid, fontSize: 13 }}>
              Annual <span style={{ color: B.teal, fontWeight: 700 }}>Save 20%</span>
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          {plans.map(p => (
            <div key={p.name} style={{
              background: B.surf,
              border: `1px solid ${p.pop ? B.teal : B.bord}`,
              borderRadius: 14, padding: 22, position: "relative",
            }}>
              {p.pop && (
                <div style={{ position: "absolute", top: -12, left: "50%",
                  transform: "translateX(-50%)",
                  background: B.grad, color: "#fff",
                  fontSize: 9, fontWeight: 800, padding: "3px 14px",
                  borderRadius: 20, whiteSpace: "nowrap" }}>MOST POPULAR</div>
              )}
              <div style={{ color: p.color, fontSize: 15, fontWeight: 900, marginBottom: 8 }}>{p.name}</div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: B.txt, fontSize: 26, fontWeight: 900 }}>₹{p.price.toLocaleString()}</span>
                <span style={{ color: B.dim, fontSize: 12 }}>/mo</span>
              </div>
              <div style={{ color: B.dim, fontSize: 11, marginBottom: 16 }}>
                {p.mins} mins · {p.profiles} profile{p.profiles > 1 ? "s" : ""} · {p.nums} number{p.nums > 1 ? "s" : ""}
              </div>
              <a href="/signup" style={{
                display: "block", textAlign: "center",
                background: p.pop ? B.grad : "transparent",
                color: p.pop ? "#fff" : B.teal,
                border: `1px solid ${p.pop ? "transparent" : B.teal + "55"}`,
                borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700,
              }}>Get Started</a>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 16, color: B.dim, fontSize: 12 }}>
          14-day free trial · No credit card · Overage ₹15/min
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "60px 24px 80px" }}>
        <div style={{
          background: `linear-gradient(135deg, ${B.orange}18, ${B.teal}18)`,
          border: `1px solid ${B.teal}44`,
          borderRadius: 20, padding: "52px 24px", maxWidth: 600, margin: "0 auto", textAlign: "center",
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>
            Start Your Free Trial Today
          </h2>
          <p style={{ color: B.mid, fontSize: 14, marginBottom: 28 }}>
            14 days free. No credit card. Setup in 60 seconds.
            Your Jovio Telugu receptionist handles the first call today.
          </p>
          <a href="/signup" style={{
            display: "inline-block", background: B.grad, color: "#fff",
            borderRadius: 12, padding: "15px 36px", fontSize: 15, fontWeight: 800,
          }}>Get Started Free →</a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${B.bord}`, padding: "28px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center",
          gap: 10, marginBottom: 10 }}>
          <JovioLogo size={28} />
          <span style={{ fontWeight: 900, fontSize: 16,
            background: B.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Jovio
          </span>
          <span style={{ color: B.dim, fontSize: 12 }}>· Telugu AI Receptionist</span>
        </div>
        <div style={{ color: B.dim, fontSize: 11, marginBottom: 6 }}>
          Powered by <span style={{ color: B.teal, fontWeight: 700 }}>Jovio Tech Labs</span>
        </div>
        <div style={{ color: B.dim, fontSize: 11 }}>
          © 2026 Jovio Global Technologies ·{" "}
          <a href="/privacy" style={{ color: B.dim }}>Privacy</a> ·{" "}
          <a href="/terms" style={{ color: B.dim }}>Terms</a>
        </div>
      </footer>
    </div>
  );
}
