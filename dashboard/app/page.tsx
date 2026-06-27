"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/dashboard");
      else router.push("/login");
    });
  }, [router]);
  return (
    <div style={{
      minHeight: "100vh", background: "#07070F", color: "#F0F0FF",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 60, height: 60, margin: "0 auto 16px",
          background: "linear-gradient(135deg, #F97316, #10B981)",
          borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 900, fontSize: 32, animation: "pulse 1.5s infinite",
        }}>J</div>
        <p style={{ color: "#9090B0", fontSize: 14 }}>Loading Jovio...</p>
      </div>
    </div>
  );
}
