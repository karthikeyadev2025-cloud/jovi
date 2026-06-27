// K² Vob Marketing Website — app/page.tsx
// Deploy to Vercel: npx create-next-app k2vob-web --typescript --tailwind --app
// Replace app/page.tsx with this file

"use client";
import { useState, useEffect, useRef } from "react";

// ── TYPES ────────────────────────────────────────────────
interface StatProps { value: string; label: string; }
interface FeatureProps { icon: string; title: string; desc: string; }
interface PlanProps {
  name: string; price: string; annual: string; color: string;
  minutes: number; profiles: number; numbers: number; popular?: boolean;
  features: string[];
}

// ── COLORS & DESIGN ──────────────────────────────────────
const styles = {
  bg:     "#07070D",
  surf:   "#0F0F1A",
  hi:     "#161625",
  bord:   "#1E1E35",
  glow:   "#8B5CF6",
  gbr:    "#A78BFA",
  gold:   "#F59E0B",
  grn:    "#10B981",
  txt:    "#EEEEFF",
  mid:    "#8888AA",
  dim:    "#44445A",
};

// ── COMPONENTS ───────────────────────────────────────────
function GlowDot() {
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: styles.glow, boxShadow: `0 0 12px ${styles.glow}`,
      marginRight: 8, flexShrink: 0,
    }} />
  );
}

function Stat({ value, label }: StatProps) {
  return (
    <div style={{ textAlign: "center", padding: "16px 20px" }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: styles.glow, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: styles.mid, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
    </div>
  );
}

function Feature({ icon, title, desc }: FeatureProps) {
  return (
    <div style={{
      background: styles.surf, border: `1px solid ${styles.bord}`,
      borderRadius: 12, padding: 20,
    }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div style={{ color: styles.txt, fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{title}</div>
      <div style={{ color: styles.mid, fontSize: 12, lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

function Plan({ name, price, annual, color, minutes, profiles, numbers, popular, features }: PlanProps) {
  return (
    <div style={{
      background: styles.surf,
      border: `1px solid ${popular ? styles.glow : styles.bord}`,
      borderRadius: 12, padding: 20, position: "relative",
    }}>
      {popular && (
        <div style={{
          position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
          background: styles.glow, color: "#fff",
          fontSize: 9, fontWeight: 800, padding: "3px 12px", borderRadius: 20, whiteSpace: "nowrap",
        }}>MOST POPULAR</div>
      )}
      <div style={{ color, fontSize: 15, fontWeight: 900, marginBottom: 6 }}>{name}</div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: styles.txt, fontSize: 26, fontWeight: 900 }}>{price}</span>
        <span style={{ color: styles.dim, fontSize: 12 }}>/month</span>
      </div>
      <div style={{ color: styles.dim, fontSize: 10, marginBottom: 16 }}>Annual: {annual}/month (20% off)</div>
      <div style={{ color: styles.mid, fontSize: 11, marginBottom: 12 }}>
        {minutes} mins · {profiles} profile{profiles > 1 ? "s" : ""} · {numbers} number{numbers > 1 ? "s" : ""}
      </div>
      {features.map(f => (
        <div key={f} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <span style={{ color: styles.grn }}>✓</span>
          <span style={{ color: styles.mid, fontSize: 12 }}>{f}</span>
        </div>
      ))}
      <a href="/signup" style={{
        display: "block", marginTop: 16, textAlign: "center",
        background: popular ? styles.glow : "transparent",
        color: popular ? "#fff" : styles.gbr,
        border: `1px solid ${popular ? styles.glow : styles.bord}`,
        borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700,
        textDecoration: "none", cursor: "pointer",
      }}>Get Started</a>
    </div>
  );
}

// ── LIVE CALL COUNTER ─────────────────────────────────────
function LiveCallCounter() {
  const [count, setCount] = useState(147);
  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: styles.hi, border: `1px solid ${styles.bord}`,
      borderRadius: 20, padding: "6px 14px", fontSize: 12, color: styles.mid,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%", background: styles.grn,
        boxShadow: `0 0 8px ${styles.grn}`, flexShrink: 0,
        animation: "pulse 2s infinite",
      }} />
      <span style={{ color: styles.grn, fontWeight: 700 }}>{count.toLocaleString()}</span>
      <span>calls handled today</span>
    </div>
  );
}

// ── AUDIO DEMO PLAYER ────────────────────────────────────
function DemoPlayer() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const conversation = [
    { role: "caller",  text: "హలో, నాకు రేపు appointment కావాలి", time: "0:00" },
    { role: "agent",   text: "నమస్కారం! రేపు మీకు ఏ time convenient?", time: "0:03" },
    { role: "caller",  text: "Morning 10 గంటలకి possible అవుతుందా?", time: "0:07" },
    { role: "agent",   text: "పదింటికి available ఉంది. మీ పేరు చెప్పగలరా?", time: "0:10" },
    { role: "caller",  text: "రమేష్ కుమార్", time: "0:14" },
    { role: "agent",   text: "రమేష్ గారు, రేపు 10am appointment confirm అయింది. WhatsApp message వస్తుంది.", time: "0:16" },
  ];

  const [visibleLines, setVisibleLines] = useState(0);

  const handlePlay = () => {
    if (playing) {
      setPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setPlaying(true);
    setVisibleLines(0);
    setProgress(0);
    let line = 0;
    timerRef.current = setInterval(() => {
      line++;
      setVisibleLines(line);
      setProgress(Math.round((line / conversation.length) * 100));
      if (line >= conversation.length) {
        setPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 2200);
  };

  return (
    <div style={{
      background: styles.surf, border: `1px solid ${styles.bord}`,
      borderRadius: 14, padding: 20, maxWidth: 500, margin: "0 auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: styles.mid }}>Live Demo — Telugu Receptionist Call</div>
        <span style={{
          background: `${styles.grn}22`, color: styles.grn,
          border: `1px solid ${styles.grn}44`, borderRadius: 4,
          padding: "2px 8px", fontSize: 10, fontWeight: 800,
        }}>LIVE EXAMPLE</span>
      </div>

      <div style={{ minHeight: 180, marginBottom: 14 }}>
        {conversation.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{
            display: "flex", gap: 10, marginBottom: 10,
            justifyContent: line.role === "agent" ? "flex-start" : "flex-end",
          }}>
            {line.role === "agent" && (
              <div style={{
                width: 28, height: 28, borderRadius: "50%", background: `${styles.glow}33`,
                border: `1px solid ${styles.glow}`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 12, flexShrink: 0,
              }}>🤖</div>
            )}
            <div style={{
              background: line.role === "agent" ? styles.hi : `${styles.glow}22`,
              border: `1px solid ${line.role === "agent" ? styles.bord : styles.glow + "44"}`,
              borderRadius: 10, padding: "8px 12px", maxWidth: "75%",
            }}>
              <div style={{ color: styles.txt, fontSize: 12, lineHeight: 1.5 }}>{line.text}</div>
              <div style={{ color: styles.dim, fontSize: 9, marginTop: 3 }}>{line.time}</div>
            </div>
            {line.role === "caller" && (
              <div style={{
                width: 28, height: 28, borderRadius: "50%", background: `${styles.gold}22`,
                border: `1px solid ${styles.gold}44`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 12, flexShrink: 0,
              }}>👤</div>
            )}
          </div>
        ))}
        {visibleLines === 0 && !playing && (
          <div style={{ textAlign: "center", color: styles.dim, fontSize: 12, paddingTop: 40 }}>
            Press play to see a live Telugu conversation
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: styles.bord, borderRadius: 2, marginBottom: 12 }}>
        <div style={{
          height: "100%", background: styles.glow, borderRadius: 2,
          width: `${progress}%`, transition: "width 0.3s ease",
        }} />
      </div>

      <button onClick={handlePlay} style={{
        width: "100%", background: playing ? `${styles.grn}22` : styles.glow,
        color: playing ? styles.grn : "#fff",
        border: `1px solid ${playing ? styles.grn : styles.glow}`,
        borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700,
        cursor: "pointer",
      }}>
        {playing ? "⏸ Playing..." : progress === 100 ? "▶ Replay Demo" : "▶ Play Telugu Demo"}
      </button>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────
export default function HomePage() {
  const [annual, setAnnual] = useState(false);

  const useCases = [
    { icon: "🏥", name: "Clinics & Hospitals", desc: "Book patient appointments 24/7 in Telugu. Handle missed calls after hours. Send WhatsApp confirmations." },
    { icon: "🏗️", name: "Real Estate", desc: "Capture leads automatically. Book site visits. Send brochures via WhatsApp. Never miss a hot lead." },
    { icon: "📚", name: "Coaching Institutes", desc: "Handle admission enquiries. Book counselling sessions. Send fee details and schedule via WhatsApp." },
    { icon: "🛒", name: "Retail & Business", desc: "Answer product enquiries. Take orders. Handle complaints. Your business never sleeps." },
  ];

  const plans: PlanProps[] = [
    {
      name: "Starter", color: styles.mid,
      price: annual ? "₹1,599" : "₹1,999",
      annual: "₹1,599",
      minutes: 200, profiles: 1, numbers: 1,
      features: ["Telugu + Tanglish AI", "Inbound reception", "Call recordings (90 days)", "WhatsApp automation", "Appointment booking"],
    },
    {
      name: "Growth", color: styles.gbr,
      price: annual ? "₹3,999" : "₹4,999",
      annual: "₹3,999",
      minutes: 600, profiles: 3, numbers: 3, popular: true,
      features: ["Everything in Starter", "3 voice profiles", "Outbound campaigns", "Advanced analytics", "Recordings 1 year"],
    },
    {
      name: "Scale", color: styles.gold,
      price: annual ? "₹7,999" : "₹9,999",
      annual: "₹7,999",
      minutes: 1500, profiles: 10, numbers: 10,
      features: ["Everything in Growth", "10 voice profiles", "API access + webhooks", "Team members (5 seats)", "Custom integrations"],
    },
  ];

  return (
    <div style={{ background: styles.bg, minHeight: "100vh", color: styles.txt, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `${styles.surf}ee`, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${styles.bord}`,
        padding: "0 24px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <GlowDot />
            <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.02em" }}>K² Vob</span>
            <span style={{ color: styles.dim, fontSize: 11 }}>Telugu AI Receptionist</span>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <a href="#features" style={{ color: styles.mid, fontSize: 13 }}>Features</a>
            <a href="#pricing" style={{ color: styles.mid, fontSize: 13 }}>Pricing</a>
            <a href="/login" style={{ color: styles.mid, fontSize: 13 }}>Login</a>
            <a href="/signup" style={{
              background: styles.glow, color: "#fff", borderRadius: 8,
              padding: "8px 16px", fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}>Start Free Trial</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "80px 24px 60px", textAlign: "center", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <LiveCallCounter />
        </div>

        <h1 style={{
          fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 900,
          letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 16,
        }}>
          Your Business Gets a{" "}
          <span style={{
            background: `linear-gradient(135deg, ${styles.glow}, ${styles.gold})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Telugu AI Receptionist</span>
          {" "}That Never Sleeps
        </h1>

        <p style={{ fontSize: 16, color: styles.mid, lineHeight: 1.7, marginBottom: 32, maxWidth: 560, margin: "0 auto 32px" }}>
          Upload your number. Pick a voice profile. Go live in 60 seconds.
          Your AI receptionist answers every call in Telugu, books appointments,
          and sends WhatsApp confirmations — fully automated.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <a href="/signup" style={{
            background: styles.glow, color: "#fff", borderRadius: 10,
            padding: "14px 28px", fontSize: 15, fontWeight: 800, textDecoration: "none",
          }}>Start Free 14-Day Trial</a>
          <button onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })} style={{
            background: "transparent", color: styles.gbr,
            border: `1px solid ${styles.glow}44`, borderRadius: 10,
            padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>Watch Live Demo ↓</button>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex", justifyContent: "center", flexWrap: "wrap",
          background: styles.surf, border: `1px solid ${styles.bord}`,
          borderRadius: 12, padding: "8px 0", gap: 0,
        }}>
          <Stat value="<700ms" label="Response time" />
          <Stat value="₹3.28" label="Cost per minute" />
          <Stat value="4 SKUs" label="Voice profiles" />
          <Stat value="Telugu" label="Native AI" />
        </div>
      </section>

      {/* DEMO */}
      <section id="demo" style={{ padding: "60px 24px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ color: styles.glow, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Live Demo</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Hear It Handle a Real Telugu Call</h2>
          <p style={{ color: styles.mid, fontSize: 13 }}>Appointment booking in Telugu — under 700ms response, zero setup by the business owner.</p>
        </div>
        <DemoPlayer />
      </section>

      {/* USE CASES */}
      <section style={{ padding: "60px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ color: styles.glow, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Use Cases</div>
          <h2 style={{ fontSize: 26, fontWeight: 900 }}>Built for Telugu Businesses</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {useCases.map(u => (
            <div key={u.name} style={{ background: styles.surf, border: `1px solid ${styles.bord}`, borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{u.icon}</div>
              <div style={{ color: styles.txt, fontSize: 13, fontWeight: 800, marginBottom: 6 }}>{u.name}</div>
              <div style={{ color: styles.mid, fontSize: 12, lineHeight: 1.6 }}>{u.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "60px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ color: styles.glow, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Features</div>
          <h2 style={{ fontSize: 26, fontWeight: 900 }}>Everything Your Receptionist Does — Automated</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <Feature icon="📞" title="Answers Every Call" desc="Picks up within 2 rings, 24/7. Never misses a lead — even at 2am." />
          <Feature icon="📅" title="Books Appointments" desc="Understands Telugu dates and times. Books and confirms instantly." />
          <Feature icon="💬" title="WhatsApp Automation" desc="Sends confirmation, reminders, missed call replies — automatically." />
          <Feature icon="📊" title="Deep Audit Reports" desc="Call journey maps, recordings, transcripts, intent scores." />
          <Feature icon="🔄" title="Barge-In Handling" desc="Caller interrupts mid-sentence — AI stops and listens naturally." />
          <Feature icon="👤" title="Human Transfer" desc="One word and the call transfers to your staff with full context." />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "60px 24px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ color: styles.glow, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Setup</div>
          <h2 style={{ fontSize: 26, fontWeight: 900 }}>Live in Under 60 Seconds</h2>
        </div>
        {[
          ["01", "Upload Your Number",    "Paste your existing business phone number. We assign a Telugu AI line."],
          ["02", "Pick a Voice Profile",  "Choose: Clinic / Real Estate / Standard / Premium. One dropdown. Done."],
          ["03", "Fill Business Form",    "Business name, hours, services. 60 seconds total."],
          ["04", "Go Live",              "Your AI receptionist is live. First call handled automatically."],
        ].map(([n, t, d]) => (
          <div key={n} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
            <div style={{
              background: `${styles.glow}33`, color: styles.gbr, borderRadius: 8,
              padding: "4px 10px", fontSize: 11, fontWeight: 900, flexShrink: 0,
            }}>{n}</div>
            <div>
              <div style={{ color: styles.txt, fontSize: 13, fontWeight: 700 }}>{t}</div>
              <div style={{ color: styles.mid, fontSize: 12, marginTop: 2 }}>{d}</div>
            </div>
          </div>
        ))}
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "60px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ color: styles.glow, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Pricing</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }}>Simple, Transparent Pricing</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
            <span style={{ color: styles.mid, fontSize: 13 }}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} style={{
              width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
              background: annual ? styles.glow : styles.bord, position: "relative",
              transition: "background 0.2s",
            }}>
              <span style={{
                position: "absolute", top: 2, left: annual ? 22 : 2,
                width: 20, height: 20, borderRadius: "50%", background: "#fff",
                transition: "left 0.2s",
              }} />
            </button>
            <span style={{ color: styles.mid, fontSize: 13 }}>Annual <span style={{ color: styles.grn, fontWeight: 700 }}>Save 20%</span></span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {plans.map(p => <Plan key={p.name} {...p} />)}
        </div>
        <div style={{ textAlign: "center", marginTop: 20, color: styles.dim, fontSize: 12 }}>
          All plans include 14-day free trial · No credit card required · Overage: ₹15/min
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "60px 24px 80px", textAlign: "center" }}>
        <div style={{
          background: `linear-gradient(135deg, ${styles.glow}22, ${styles.surf})`,
          border: `1px solid ${styles.glow}44`, borderRadius: 16, padding: "48px 24px",
          maxWidth: 600, margin: "0 auto",
        }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }}>
            Start Your Free Trial Today
          </h2>
          <p style={{ color: styles.mid, fontSize: 14, marginBottom: 24 }}>
            14 days free. No credit card. Setup in 60 seconds.
            Your Telugu AI receptionist handles the first call today.
          </p>
          <a href="/signup" style={{
            display: "inline-block", background: styles.glow, color: "#fff",
            borderRadius: 10, padding: "14px 32px", fontSize: 15, fontWeight: 800,
            textDecoration: "none",
          }}>Get Started Free →</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${styles.bord}`, padding: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <GlowDot />
          <span style={{ fontWeight: 900, fontSize: 14 }}>K² Vob</span>
        </div>
        <div style={{ color: styles.dim, fontSize: 11 }}>
          © 2026 K2 Adexos Global Technologies · Telugu AI Receptionist SaaS ·{" "}
          <a href="/privacy" style={{ color: styles.dim }}>Privacy</a> ·{" "}
          <a href="/terms" style={{ color: styles.dim }}>Terms</a>
        </div>
      </footer>
    </div>
  );
}
