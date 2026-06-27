"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase";

const C = {
  bg: "#07070F", surf: "#0D0D1A", hi: "#13132A", bord: "#1E1E3A",
  orange: "#F97316", teal: "#10B981",
  grad: "linear-gradient(135deg, #F97316 0%, #10B981 100%)",
  txt: "#F0F0FF", mid: "#9090B0", dim: "#44445A", red: "#EF4444",
};

export default function SignupPage() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    const sb = createClient();
    const { error: err } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { business_name: businessName },
        emailRedirectTo: window.location.origin + "/dashboard",
      },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{
          background: C.surf, border: `1px solid ${C.bord}`,
          borderRadius: 16, padding: 40, maxWidth: 400, textAlign: "center",
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: C.txt }}>
            Check your email
          </h2>
          <p style={{ color: C.mid, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            We sent a confirmation link to<br />
            <span style={{ color: C.teal, fontWeight: 700 }}>{email}</span>
          </p>
          <p style={{ color: C.dim, fontSize: 12, marginBottom: 24 }}>
            Click the link to verify your account and start your 14-day free trial.
          </p>
          <Link href="/login" style={{
            display: "inline-block", background: C.grad, color: "white",
            padding: "12px 28px", borderRadius: 10, textDecoration: "none",
            fontWeight: 700, fontSize: 14,
          }}>Go to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 48, height: 48, background: C.grad, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 900, fontSize: 28,
            }}>J</div>
            <div>
              <div style={{
                fontSize: 24, fontWeight: 900,
                background: C.grad, WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent", letterSpacing: -0.5,
              }}>Jovio</div>
              <div style={{ fontSize: 9, color: C.dim, letterSpacing: 1.5, fontWeight: 600 }}>
                TECH LABS
              </div>
            </div>
          </div>
          <div style={{ color: C.mid, fontSize: 14 }}>
            Start your 14-day free trial. No credit card.
          </div>
        </div>

        <div style={{
          background: C.surf, border: `1px solid ${C.bord}`,
          borderRadius: 16, padding: 32,
        }}>
          <form onSubmit={handleSignup}>
            {error && (
              <div style={{
                background: `${C.red}22`, color: C.red,
                padding: "10px 12px", borderRadius: 8,
                fontSize: 13, marginBottom: 16,
                border: `1px solid ${C.red}44`,
              }}>{error}</div>
            )}

            <label style={{ display: "block", color: C.mid, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>
              BUSINESS NAME
            </label>
            <input
              type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
              required placeholder="Ravi Clinic, Banjara Hills"
              style={{
                width: "100%", padding: "12px 14px", fontSize: 14,
                background: C.hi, border: `1px solid ${C.bord}`, borderRadius: 10,
                color: C.txt, marginBottom: 14, outline: "none",
              }}
            />

            <label style={{ display: "block", color: C.mid, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>
              EMAIL
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="you@business.in"
              style={{
                width: "100%", padding: "12px 14px", fontSize: 14,
                background: C.hi, border: `1px solid ${C.bord}`, borderRadius: 10,
                color: C.txt, marginBottom: 14, outline: "none",
              }}
            />

            <label style={{ display: "block", color: C.mid, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>
              PASSWORD <span style={{ color: C.dim, fontWeight: 400 }}>(min 8 characters)</span>
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required minLength={8} placeholder="••••••••"
              style={{
                width: "100%", padding: "12px 14px", fontSize: 14,
                background: C.hi, border: `1px solid ${C.bord}`, borderRadius: 10,
                color: C.txt, marginBottom: 20, outline: "none",
              }}
            />

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px", fontSize: 15, fontWeight: 700,
              background: loading ? C.hi : C.grad,
              color: "white", border: "none", borderRadius: 10,
              cursor: loading ? "wait" : "pointer", marginBottom: 10,
            }}>
              {loading ? "Creating account..." : "Start Free Trial →"}
            </button>

            <p style={{ fontSize: 11, color: C.dim, textAlign: "center", margin: 0 }}>
              By signing up you agree to Jovio's Terms and Privacy Policy.
            </p>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: C.mid }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: C.teal, fontWeight: 700, textDecoration: "none" }}>
            Sign in →
          </Link>
        </div>
      </div>
    </div>
  );
}
