"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import JovioLogo from "@/components/JovioLogo";

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
      minHeight: "100vh", background: "#070B19", color: "#F8FAFC",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center", animation: "pulse 1.5s infinite" }}>
        <JovioLogo size={72} variant="icon" />
        <p style={{ color: "#9CA3AF", fontSize: 14, marginTop: 16 }}>Loading Jovio...</p>
      </div>
    </div>
  );
}
