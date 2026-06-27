// app/login/page.tsx
"use client";
import { useState } from "react";
import { createClient } from "../../lib/supabase";

const C = {
  bg:"#07070D", surf:"#0F0F1A", bord:"#1E1E35",
  glow:"#8B5CF6", gbr:"#A78BFA", grn:"#10B981",
  txt:"#EEEEFF", mid:"#8888AA", dim:"#44445A", red:"#EF4444",
};

export default function LoginPage() {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

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
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.glow,
              boxShadow: "0 0 10px " + C.glow }} />
            <span style={{ fontSize: 22, fontWeight: 900, color: C.txt }}>Jovio</span>
          </div>
          <div style={{ color: C.mid, fontSize: 13 }}>Telugu AI Receptionist — Jovio</div>
        </div>

        <div style={{ background: C.surf, border: "1px solid " + C.bord,
          borderRadius: 12, padding: 28 }}>
          <div style={{ color: C.txt, fontSize: 17, fontWeight: 800, marginBottom: 20 }}>
            Sign in to your dashboard
          </div>

          {error && (
            <div style={{ background: C.red + "22", border: "1px solid " + C.red + "44",
              borderRadius: 8, padding: "10px 12px", color: C.red, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: C.mid, fontSize: 12, fontWeight: 600,
                display: "block", marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@business.com" required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: C.mid, fontSize: 12, fontWeight: 600,
                display: "block", marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} style={{
              width: "100%", background: C.glow, color: "#fff", border: "none",
              borderRadius: 8, padding: "12px 0", fontSize: 14, fontWeight: 700,
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: C.bord }} />
            <span style={{ color: C.dim, fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: C.bord }} />
          </div>

          <button onClick={handleGoogle} style={{
            width: "100%", background: "transparent", color: C.txt,
            border: "1px solid " + C.bord, borderRadius: 8, padding: "11px 0",
            fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8,
          }}>
            <span>🔑</span> Continue with Google
          </button>

          <div style={{ textAlign: "center", marginTop: 16, color: C.dim, fontSize: 12 }}>
            No account?{" "}
            <a href="/signup" style={{ color: C.glow, fontWeight: 700 }}>Start free trial</a>
          </div>
        </div>
      </div>
    </div>
  );
}
