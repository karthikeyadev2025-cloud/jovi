"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const J = {
  bg: "#070B19",
  vault: "#111827",
  surface: "#1A2235",
  border: "#1F2937",
  borderHi: "#374151",
  mercury: "#00E676",
  surya: "#F59E0B",
  chandra: "#F8FAFC",
  textMid: "#9CA3AF",
  textDim: "#4B5563",
  grad: "linear-gradient(135deg, #F59E0B 0%, #00E676 100%)",
};

function Logo({ size = 40, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <Image
        src="/jovio-logo.jpeg"
        alt="Jovio"
        width={size}
        height={size}
        priority
        style={{ borderRadius: size * 0.18, objectFit: "cover", flexShrink: 0 }}
      />
      {showText && (
        <div style={{ lineHeight: 1.1 }}>
          <div style={{
            fontSize: size * 0.5, fontWeight: 900,
            background: J.grad, WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent", letterSpacing: -0.5,
          }}>Jovio</div>
          <div style={{
            fontSize: size * 0.18, color: J.textMid,
            letterSpacing: 1.5, fontWeight: 600, marginTop: 2,
          }}>GLOBAL TECHNOLOGIES</div>
        </div>
      )}
    </div>
  );
}

function Button({ children, primary, href }: { children: React.ReactNode; primary?: boolean; href: string }) {
  return (
    <a href={href} style={{
      display: "inline-block", padding: "13px 28px", borderRadius: 10,
      background: primary ? J.grad : "transparent",
      color: primary ? J.bg : J.chandra,
      border: primary ? "none" : `1.5px solid ${J.border}`,
      fontSize: 14, fontWeight: 700, cursor: "pointer",
      transition: "all 0.2s", textDecoration: "none",
    }}>{children}</a>
  );
}

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "5px 12px", borderRadius: 6,
      background: `${color}22`, color, fontSize: 11,
      fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
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
      background: J.surface, border: `1px solid ${J.border}`,
      borderRadius: 24, padding: "8px 18px", fontSize: 13, color: J.textMid,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%", background: J.mercury,
        boxShadow: `0 0 12px ${J.mercury}`, animation: "pulse 2s infinite",
      }} />
      <span style={{ color: J.mercury, fontWeight: 800 }}>{n.toLocaleString()}</span>
      <span>calls answered today</span>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: J.bg, color: J.chandra }}>

      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(7, 11, 25, 0.85)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${J.border}`,
        padding: "16px 5%", display: "flex",
        justifyContent: "space-between", alignItems: "center",
      }}>
        <Logo size={36} />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="#features" style={{ color: J.textMid, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            Features
          </a>
          <a href="#pricing" style={{ color: J.textMid, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            Pricing
          </a>
          <Button href="https://jovi-smoky.vercel.app/login">Sign In</Button>
          <Button primary href="https://jovi-smoky.vercel.app/signup">Get Started</Button>
        </div>
      </nav>

      <section style={{ padding: "100px 5% 80px", textAlign: "center", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 36 }}>
          <LiveCounter />
        </div>
        <h1 style={{
          fontSize: 72, fontWeight: 900, lineHeight: 1.05,
          margin: "0 0 28px", letterSpacing: -2.5,
        }}>
          Your business never<br />
          misses a call in{" "}
          <span style={{
            background: J.grad, WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>Telugu</span>
        </h1>
        <p style={{
          fontSize: 20, color: J.textMid, maxWidth: 700,
          margin: "0 auto 48px", lineHeight: 1.6,
        }}>
          Jovio is a Telugu-first AI receptionist for Indian SMBs. Answers calls 24/7,
          books appointments, and sends WhatsApp confirmations — automatically.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Button primary href="https://jovi-smoky.vercel.app/signup">Start 14-day Free Trial →</Button>
          <Button href="#demo">▶ Watch 60s Demo</Button>
        </div>
        <div style={{ marginTop: 28, fontSize: 13, color: J.textDim }}>
          No credit card · Setup in 60 seconds · Cancel anytime
        </div>
      </section>

      <section style={{
        padding: "80px 5%", background: J.vault,
        borderTop: `1px solid ${J.border}`, borderBottom: `1px solid ${J.border}`,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <Pill color={J.mercury}>TRUSTED BY INDIAN SMBS</Pill>
            <h2 style={{ fontSize: 38, fontWeight: 800, margin: "20px 0 12px", letterSpacing: -1 }}>
              Numbers that matter
            </h2>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 32, maxWidth: 1000, margin: "0 auto",
          }}>
            {[
              { v: "200+", l: "Businesses Onboarded", c: J.mercury },
              { v: "98%", l: "Call Pickup Rate", c: J.surya },
              { v: "₹3.28", l: "Cost Per Call Minute", c: J.mercury },
              { v: "60s", l: "Average Setup Time", c: J.surya },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 52, fontWeight: 900, color: s.c, lineHeight: 1, marginBottom: 8 }}>
                  {s.v}
                </div>
                <div style={{ fontSize: 13, color: J.textMid, fontWeight: 600, letterSpacing: 0.5 }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" style={{ padding: "100px 5%", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Pill color={J.surya}>FEATURES</Pill>
          <h2 style={{ fontSize: 44, fontWeight: 800, margin: "20px 0 16px", letterSpacing: -1.5 }}>
            Everything an Indian SMB needs
          </h2>
          <p style={{ fontSize: 18, color: J.textMid, maxWidth: 600, margin: "0 auto" }}>
            Built for clinics, retail shops, real estate offices, service businesses
          </p>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20,
        }}>
          {[
            { i: "🗣️", t: "Native Telugu", d: "Understands Tanglish, polite phrasing, age-appropriate responses", c: J.mercury },
            { i: "📅", t: "Books Appointments", d: "Smart slot management, calendar sync, conflict resolution", c: J.surya },
            { i: "💬", t: "WhatsApp Auto", d: "Confirmation messages sent immediately after every call", c: J.mercury },
            { i: "📞", t: "24/7 Live", d: "Never miss a call. Works during lunch, holidays, midnight", c: J.surya },
            { i: "📊", t: "Live Dashboard", d: "Real-time analytics, intent classification, conversion tracking", c: J.mercury },
            { i: "🔒", t: "DPDP Compliant", d: "Data stays in India. AWS Mumbai. TRAI disclosure on every call", c: J.surya },
          ].map((f, i) => (
            <div key={i} style={{
              background: J.vault, border: `1px solid ${J.border}`,
              borderRadius: 16, padding: 28, borderTop: `3px solid ${f.c}`,
            }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.i}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: J.chandra }}>
                {f.t}
              </h3>
              <p style={{ fontSize: 14, color: J.textMid, lineHeight: 1.6, margin: 0 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        padding: "100px 5%", background: J.vault,
        borderTop: `1px solid ${J.border}`, borderBottom: `1px solid ${J.border}`,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <Pill color={J.mercury}>HOW IT WORKS</Pill>
            <h2 style={{ fontSize: 44, fontWeight: 800, margin: "20px 0 16px", letterSpacing: -1.5 }}>
              Go live in 60 seconds
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 28 }}>
            {[
              { n: 1, t: "Sign Up", d: "Email + business name. 14-day free trial starts immediately." },
              { n: 2, t: "Configure", d: "Pick voice profile, opening hours, services. Done in 30 seconds." },
              { n: 3, t: "Connect Number", d: "Forward your business phone to Jovio. Or get a new Jovio number." },
              { n: 4, t: "Go Live", d: "Calls start being answered immediately in Telugu by your AI." },
            ].map(s => (
              <div key={s.n} style={{ textAlign: "center" }}>
                <div style={{
                  width: 60, height: 60, background: J.grad,
                  borderRadius: "50%", margin: "0 auto 20px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, fontWeight: 900, color: J.bg,
                }}>{s.n}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 12px", color: J.chandra }}>{s.t}</h3>
                <p style={{ fontSize: 14, color: J.textMid, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" style={{ padding: "100px 5%", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <Pill color={J.surya}>PRICING</Pill>
          <h2 style={{ fontSize: 44, fontWeight: 800, margin: "20px 0 16px", letterSpacing: -1.5 }}>
            Simple, transparent pricing
          </h2>
          <p style={{ fontSize: 18, color: J.textMid }}>14-day free trial · No credit card required</p>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24, maxWidth: 1100, margin: "0 auto",
        }}>
          {[
            { name: "Starter", price: 1999, mins: 200, popular: false, features: ["1 voice profile", "200 min/month", "WhatsApp confirmations", "Email support"], color: J.textMid },
            { name: "Growth", price: 4999, mins: 600, popular: true, features: ["3 voice profiles", "600 min/month", "Outbound campaigns", "Priority support", "Analytics dashboard"], color: J.mercury },
            { name: "Scale", price: 9999, mins: 1500, popular: false, features: ["10 voice profiles", "1500 min/month", "API access", "Custom integrations", "Dedicated CSM"], color: J.surya },
          ].map(p => (
            <div key={p.name} style={{
              background: J.vault, border: `1px solid ${p.popular ? p.color : J.border}`,
              borderRadius: 16, padding: 32,
              boxShadow: p.popular ? `0 0 0 1px ${p.color}` : "none",
              position: "relative",
            }}>
              {p.popular && (
                <div style={{
                  position: "absolute", top: -12, right: 24,
                  background: J.grad, color: J.bg,
                  padding: "4px 14px", borderRadius: 12,
                  fontSize: 11, fontWeight: 800, letterSpacing: 1,
                }}>MOST POPULAR</div>
              )}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px", color: p.color }}>{p.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 44, fontWeight: 900, color: J.chandra }}>₹{p.price.toLocaleString()}</span>
                  <span style={{ fontSize: 14, color: J.textMid }}>/month</span>
                </div>
                <div style={{ fontSize: 13, color: J.textDim, marginTop: 4 }}>{p.mins} minutes included</div>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
                {p.features.map(f => (
                  <li key={f} style={{
                    display: "flex", gap: 10, alignItems: "center",
                    padding: "8px 0", fontSize: 14, color: J.chandra,
                  }}>
                    <span style={{ color: p.color, fontWeight: 800 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button primary={p.popular} href="https://jovi-smoky.vercel.app/signup">
                Start Free Trial
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "120px 5%", textAlign: "center", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 56, fontWeight: 900, margin: "0 0 24px", letterSpacing: -2 }}>
          Stop missing calls.<br />
          Start with{" "}
          <span style={{
            background: J.grad, WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>Jovio</span>.
        </h2>
        <p style={{ fontSize: 18, color: J.textMid, marginBottom: 40 }}>
          Join 200+ Indian businesses already running on Jovio
        </p>
        <Button primary href="https://jovi-smoky.vercel.app/signup">Start Free Trial →</Button>
      </section>

      <footer style={{
        padding: "48px 5%", background: J.vault,
        borderTop: `1px solid ${J.border}`, textAlign: "center",
      }}>
        <Logo size={36} />
        <p style={{ fontSize: 13, color: J.textDim, marginTop: 20 }}>
          © 2026 Jovio Global Technologies · Made in India 🇮🇳 · jovio.in
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16, fontSize: 13 }}>
          <a href="#" style={{ color: J.textMid, textDecoration: "none" }}>Privacy</a>
          <a href="#" style={{ color: J.textMid, textDecoration: "none" }}>Terms</a>
          <a href="mailto:hello@jovio.in" style={{ color: J.textMid, textDecoration: "none" }}>hello@jovio.in</a>
        </div>
      </footer>

    </div>
  );
}
