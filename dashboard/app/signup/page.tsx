// app/signup/page.tsx
"use client";
import { useState } from "react";
import { createClient } from "../../lib/supabase";

const C = {
  bg:"#07070D", surf:"#0F0F1A", bord:"#1E1E35",
  glow:"#8B5CF6", gbr:"#A78BFA", grn:"#10B981",
  txt:"#EEEEFF", mid:"#8888AA", dim:"#44445A", red:"#EF4444",
};

export default function SignupPage() {
  const [form, setForm] = useState({ businessName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSignup = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    setError("");
    const sb = createClient();
    const { error: err } = await sb.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { business_name: form.businessName } },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: C.surf, border: "1px solid " + C.grn + "44",
          borderRadius: 12, padding: 32, maxWidth: 380, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
          <div style={{ color: C.txt, fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
            Check your email
          </div>
          <div style={{ color: C.mid, fontSize: 13, lineHeight: 1.6 }}>
            We sent a confirmation link to <strong style={{ color: C.txt }}>{form.email}</strong>.
            Click it to activate your 14-day free trial.
          </div>
          <a href="/login" style={{ display: "block", marginTop: 20, color: C.glow, fontSize: 13 }}>
            Already confirmed? Sign in →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.glow,
              boxShadow: "0 0 10px " + C.glow }} />
            <span style={{ fontSize: 22, fontWeight: 900, color: C.txt }}>K² Vob</span>
          </div>
          <div style={{ color: C.mid, fontSize: 13 }}>
            14-day free trial · No credit card
          </div>
        </div>

        <div style={{ background: C.surf, border: "1px solid " + C.bord,
          borderRadius: 12, padding: 28 }}>
          <div style={{ color: C.txt, fontSize: 17, fontWeight: 800, marginBottom: 20 }}>
            Create your account
          </div>

          {error && (
            <div style={{ background: C.red + "22", border: "1px solid " + C.red + "44",
              borderRadius: 8, padding: "10px 12px", color: C.red, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            {[
              { key: "businessName", label: "Business Name", type: "text",    placeholder: "Ravi Clinic, Hyderabad" },
              { key: "email",        label: "Email",          type: "email",   placeholder: "you@business.com"       },
              { key: "password",     label: "Password",       type: "password",placeholder: "Min 8 characters"       },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ color: C.mid, fontSize: 12, fontWeight: 600,
                  display: "block", marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]}
                  onChange={set(f.key)} placeholder={f.placeholder} required
                  minLength={f.key === "password" ? 8 : undefined} />
              </div>
            ))}

            <button type="submit" disabled={loading} style={{
              width: "100%", background: C.glow, color: "#fff", border: "none",
              borderRadius: 8, padding: "12px 0", fontSize: 14, fontWeight: 700,
              marginTop: 6, opacity: loading ? 0.7 : 1,
            }}>
              {loading ? "Creating account..." : "Start Free Trial →"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 16, color: C.dim, fontSize: 12 }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: C.glow, fontWeight: 700 }}>Sign in</a>
          </div>
          <div style={{ textAlign: "center", marginTop: 8, color: C.dim, fontSize: 11 }}>
            By signing up you agree to our Terms & Privacy Policy
          </div>
        </div>
      </div>
    </div>
  );
}
