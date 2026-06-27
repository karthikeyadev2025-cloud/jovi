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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const sb = createClient();
    const { error: err } = await sb.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    window.location.href = "/dashboard";
  };

  const handleGoogle = async () => {
    const sb = createClient();
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
  };

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
            Welcome back. Sign in to continue.
          </div>
        </div>

        <div style={{
          background: C.surf, border: `1px solid ${C.bord}`,
          borderRadius: 16, padding: 32,
        }}>
          <form onSubmit={handleLogin}>
            {error && (
              <div style={{
                background: `${C.red}22`, color: C.red,
                padding: "10px 12px", borderRadius: 8,
                fontSize: 13, marginBottom: 16,
                border: `1px solid ${C.red}44`,
              }}>{error}</div>
            )}

            <label style={{ display: "block", color: C.mid, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>
              EMAIL
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="you@business.in"
              style={{
                width: "100%", padding: "12px 14px", fontSize: 14,
                background: C.hi, border: `1px solid ${C.bord}`, borderRadius: 10,
                color: C.txt, marginBottom: 16, outline: "none",
              }}
            />

            <label style={{ display: "block", color: C.mid, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>
              PASSWORD
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="••••••••"
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
              cursor: loading ? "wait" : "pointer", marginBottom: 16,
            }}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>

            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              color: C.dim, fontSize: 11, margin: "16px 0",
            }}>
              <div style={{ flex: 1, height: 1, background: C.bord }} />
              OR
              <div style={{ flex: 1, height: 1, background: C.bord }} />
            </div>

            <button type="button" onClick={handleGoogle} style={{
              width: "100%", padding: "12px", fontSize: 14, fontWeight: 600,
              background: C.hi, color: C.txt,
              border: `1px solid ${C.bord}`, borderRadius: 10, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              <span style={{ fontSize: 16 }}>🔑</span> Continue with Google
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: C.mid }}>
          New to Jovio?{" "}
          <Link href="/signup" style={{ color: C.teal, fontWeight: 700, textDecoration: "none" }}>
            Start free trial →
          </Link>
        </div>
      </div>
    </div>
  );
}
