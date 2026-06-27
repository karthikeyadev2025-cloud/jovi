"use client";
import { useState, useEffect } from "react";

const C = {
  bg: "#07070F",
  surf: "#0D0D1A",
  hi: "#13132A",
  bord: "#1E1E3A",
  orange: "#F97316",
  teal: "#10B981",
  grad: "linear-gradient(135deg, #F97316 0%, #10B981 100%)",
  txt: "#F0F0FF",
  mid: "#9090B0",
  dim: "#44445A",
};

function Logo({ size = 40 }: { size?: number }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: size, height: size, background: C.grad,
        borderRadius: size * 0.25, display: "flex",
        alignItems: "center", justifyContent: "center",
        color: "white", fontWeight: 900, fontSize: size * 0.55,
        letterSpacing: -1,
      }}>J</div>
      <div>
        <div style={{
          fontSize: size * 0.45, fontWeight: 900,
          background: C.grad,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: -0.5, lineHeight: 1,
        }}>Jovio</div>
        <div style={{ fontSize: size * 0.2, color: C.dim, letterSpacing: 1.5, fontWeight: 600, marginTop: 2 }}>
          TECH LABS
        </div>
      </div>
    </div>
  );
}

function GradientText({ children, size = 16 }: { children: React.ReactNode; size?: number }) {
  return (
    <span style={{
      background: C.grad, WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent", fontSize: size, fontWeight: 800,
    }}>{children}</span>
  );
}

function Button({ children, primary, onClick }: { children: React.ReactNode; primary?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "14px 28px", borderRadius: 12,
      background: primary ? C.grad : "transparent",
      color: primary ? "white" : C.txt,
      border: primary ? "none" : `1.5px solid ${C.bord}`,
      fontSize: 15, fontWeight: 700, cursor: "pointer",
      transition: "all 0.2s",
    }}>{children}</button>
  );
}

function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      background: C.surf, border: `1px solid ${C.bord}`,
      borderRadius: 16, padding: 28,
      borderTop: accent ? `3px solid ${accent}` : undefined,
    }}>{children}</div>
  );
}

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "4px 10px", borderRadius: 6,
      background: `${color}22`, color, fontSize: 11,
      fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
      border: `1px solid ${color}44`,
    }}>{children}</span>
  );
}

function LiveCounter() {
  const [n, setN] = useState(1847);
  useEffect(() => {
    const t = setInterval(() => setN(c => c + Math.floor(Math.random() * 3) + 1), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: C.hi, border: `1px solid ${C.bord}`,
      borderRadius: 20, padding: "7px 16px", fontSize: 13, color: C.mid,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%", background: C.teal,
        boxShadow: `0 0 8px ${C.teal}`, animation: "pulse 2s infinite",
      }} />
      <span style={{ color: C.teal, fontWeight: 700 }}>{n.toLocaleString()}</span>
      <span>calls answered today</span>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.txt }}>

      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(7, 7, 15, 0.85)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.bord}`,
        padding: "16px 5%", display: "flex",
        justifyContent: "space-between", alignItems: "center",
      }}>
        <Logo size={36} />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="#features" style={{ color: C.mid, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            Features
          </a>
          <a href="#pricing" style={{ color: C.mid, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            Pricing
          </a>
          <a href="https://jovi-smoky.vercel.app/login" style={{ textDecoration: "none" }}>
            <Button>Sign In</Button>
          </a>
          <a href="https://jovi-smoky.vercel.app/signup" style={{ textDecoration: "none" }}>
            <Button primary>Get Started</Button>
          </a>
        </div>
      </nav>

      <section style={{ padding: "80px 5%", textAlign: "center", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <LiveCounter />
        </div>
        <h1 style={{
          fontSize: 64, fontWeight: 900, lineHeight: 1.1,
          margin: "0 0 24px", letterSpacing: -2,
        }}>
          Your business never<br />
          misses a call in{" "}
          <span style={{
            background: C.grad, WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>Telugu</span>
        </h1>
        <p style={{
          fontSize: 20, color: C.mid, maxWidth: 700,
          margin: "0 auto 48px", lineHeight: 1.6,
        }}>
          Jovio is a Telugu-first AI receptionist for Indian SMBs. Answers calls 24/7,
          books appointments, and sends WhatsApp confirmations — automatically.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://jovi-smoky.vercel.app/signup" style={{ textDecoration: "none" }}>
            <Button primary>Start 14-day Free Trial →</Button>
          </a>
          <a href="#demo" style={{ textDecoration: "none" }}>
            <Button>▶ Watch 60s Demo</Button>
          </a>
        </div>
        <div style={{ marginTop: 24, fontSize: 13, color: C.dim }}>
          No credit card · Setup in 60 seconds · Cancel anytime
        </div>
      </section>

      <section style={{ padding: "80px 5%", background: C.surf, borderTop: `1px solid ${C.bord}`, borderBottom: `1px solid ${C.bord}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <Pill color={C.teal}>SOCIAL PROOF</Pill>
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: "20px 0 12px", letterSpacing: -1 }}>
              Trusted by Indian businesses
            </h2>
            <p style={{ fontSize: 16, color: C.mid }}>Real numbers from real customers</p>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 24, maxWidth: 1000, margin: "0 auto",
          }}>
            {[
              { v: "200+", l: "Businesses Onboarded", c: C.teal },
              { v: "98%", l: "Call Pickup Rate", c: C.orange },
              { v: "₹3.28", l: "Cost Per Call Minute", c: C.teal },
              { v: "60s", l: "Average Setup Time", c: C.orange },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: s.c, lineHeight: 1, marginBottom: 8 }}>
                  {s.v}
                </div>
                <div style={{ fontSize: 13, color: C.mid, fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" style={{ padding: "100px 5%", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Pill color={C.orange}>FEATURES</Pill>
          <h2 style={{ fontSize: 42, fontWeight: 800, margin: "20px 0 16px", letterSpacing: -1 }}>
            Everything an Indian SMB needs
          </h2>
          <p style={{ fontSize: 18, color: C.mid, maxWidth: 600, margin: "0 auto" }}>
            Built for clinics, retail shops, real estate offices, and service businesses
          </p>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24,
        }}>
          {[
            { i: "🗣️", t: "Native Telugu", d: "Understands Tanglish, handles polite phrasing, age-appropriate responses", c: C.teal },
            { i: "📅", t: "Books Appointments", d: "Smart slot management, calendar sync, conflict resolution", c: C.orange },
            { i: "💬", t: "WhatsApp Auto", d: "Confirmation messages sent immediately after every call", c: C.teal },
            { i: "📞", t: "24/7 Live", d: "Never miss a call. Works during lunch, holidays, midnight", c: C.orange },
            { i: "📊", t: "Live Dashboard", d: "Real-time call analytics, intent classification, conversion tracking", c: C.teal },
            { i: "🔒", t: "DPDP Compliant", d: "Data stays in India. AWS Mumbai. TRAI disclosure on every call", c: C.orange },
          ].map((f, i) => (
            <Card key={i} accent={f.c}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.i}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px" }}>{f.t}</h3>
              <p style={{ fontSize: 14, color: C.mid, lineHeight: 1.6, margin: 0 }}>{f.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section style={{ padding: "100px 5%", background: C.surf, borderTop: `1px solid ${C.bord}`, borderBottom: `1px solid ${C.bord}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <Pill color={C.teal}>HOW IT WORKS</Pill>
            <h2 style={{ fontSize: 42, fontWeight: 800, margin: "20px 0 16px", letterSpacing: -1 }}>
              Go live in 60 seconds
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {[
              { n: 1, t: "Sign Up", d: "Email + business name. 14-day free trial starts immediately." },
              { n: 2, t: "Configure", d: "Pick voice profile, opening hours, services. Done in 30 seconds." },
              { n: 3, t: "Connect Number", d: "Forward your business phone to Jovio. Or get a new Jovio number." },
              { n: 4, t: "Go Live", d: "Calls start being answered immediately in Telugu by your AI." },
            ].map(s => (
              <div key={s.n} style={{ textAlign: "center" }}>
                <div style={{
                  width: 56, height: 56, background: C.grad,
                  borderRadius: "50%", margin: "0 auto 20px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, fontWeight: 900, color: "white",
                }}>{s.n}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 12px" }}>{s.t}</h3>
                <p style={{ fontSize: 14, color: C.mid, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" style={{ padding: "100px 5%", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Pill color={C.orange}>PRICING</Pill>
          <h2 style={{ fontSize: 42, fontWeight: 800, margin: "20px 0 16px", letterSpacing: -1 }}>
            Simple, transparent pricing
          </h2>
          <p style={{ fontSize: 18, color: C.mid }}>14-day free trial · No credit card required</p>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24, maxWidth: 1100, margin: "0 auto",
        }}>
          {[
            { name: "Starter", price: 1999, mins: 200, popular: false, features: ["1 voice profile", "200 min/month", "WhatsApp confirmations", "Email support"], color: C.mid },
            { name: "Growth", price: 4999, mins: 600, popular: true, features: ["3 voice profiles", "600 min/month", "Outbound campaigns", "Priority support", "Analytics dashboard"], color: C.teal },
            { name: "Scale", price: 9999, mins: 1500, popular: false, features: ["10 voice profiles", "1500 min/month", "API access", "Custom integrations", "Dedicated CSM"], color: C.orange },
          ].map(p => (
            <div key={p.name} style={{
              background: C.surf, border: `1px solid ${p.popular ? p.color : C.bord}`,
              borderRadius: 16, padding: 32,
              boxShadow: p.popular ? `0 0 0 1px ${p.color}` : "none",
              position: "relative",
            }}>
              {p.popular && (
                <div style={{
                  position: "absolute", top: -12, right: 24,
                  background: C.grad, color: "white",
                  padding: "4px 14px", borderRadius: 12,
                  fontSize: 11, fontWeight: 800, letterSpacing: 1,
                }}>MOST POPULAR</div>
              )}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px", color: p.color }}>{p.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 40, fontWeight: 900 }}>₹{p.price.toLocaleString()}</span>
                  <span style={{ fontSize: 14, color: C.mid }}>/month</span>
                </div>
                <div style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>{p.mins} minutes included</div>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
                {p.features.map(f => (
                  <li key={f} style={{
                    display: "flex", gap: 10, alignItems: "center",
                    padding: "8px 0", fontSize: 14, color: C.txt,
                  }}>
                    <span style={{ color: p.color, fontWeight: 800 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="https://jovi-smoky.vercel.app/signup" style={{ textDecoration: "none" }}>
                <Button primary={p.popular}>Start Free Trial</Button>
              </a>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "100px 5%", textAlign: "center", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 48, fontWeight: 900, margin: "0 0 24px", letterSpacing: -1.5 }}>
          Stop missing calls.<br />
          Start with <GradientText size={48}>Jovio</GradientText>.
        </h2>
        <p style={{ fontSize: 18, color: C.mid, marginBottom: 40 }}>
          Join 200+ Indian businesses already running on Jovio
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://jovi-smoky.vercel.app/signup" style={{ textDecoration: "none" }}>
            <Button primary>Start Free Trial →</Button>
          </a>
        </div>
      </section>

      <footer style={{
        padding: "48px 5%", background: C.surf,
        borderTop: `1px solid ${C.bord}`, textAlign: "center",
      }}>
        <Logo size={32} />
        <p style={{ fontSize: 13, color: C.dim, marginTop: 20 }}>
          © 2026 Jovio Global Technologies · Made in India 🇮🇳 · jovio.in
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16, fontSize: 13 }}>
          <a href="#" style={{ color: C.mid, textDecoration: "none" }}>Privacy</a>
          <a href="#" style={{ color: C.mid, textDecoration: "none" }}>Terms</a>
          <a href="mailto:hello@jovio.in" style={{ color: C.mid, textDecoration: "none" }}>hello@jovio.in</a>
        </div>
      </footer>

    </div>
  );
}
