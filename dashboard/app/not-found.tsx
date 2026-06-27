"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", background: "#07070F", color: "#F0F0FF",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{
          width: 80, height: 80, margin: "0 auto 24px",
          background: "linear-gradient(135deg, #F97316, #10B981)",
          borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 900, fontSize: 44,
        }}>J</div>
        <h1 style={{ fontSize: 48, fontWeight: 900, margin: "0 0 12px" }}>404</h1>
        <p style={{ color: "#9090B0", fontSize: 16, marginBottom: 32 }}>
          This page doesn't exist on Jovio.
        </p>
        <Link href="/" style={{
          display: "inline-block",
          background: "linear-gradient(135deg, #F97316, #10B981)",
          color: "white", padding: "12px 28px", borderRadius: 12,
          textDecoration: "none", fontWeight: 700, fontSize: 14,
        }}>← Back to Jovio</Link>
      </div>
    </div>
  );
}
