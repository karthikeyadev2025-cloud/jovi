"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
      minHeight: "100vh", background: "#070B19", color: "#F8FAFC",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <Image src="/jovio-logo.jpeg" alt="Jovio" width={72} height={72}
          priority style={{ borderRadius: 14, objectFit: "cover", marginBottom: 16, animation: "pulse 1.5s infinite" }} />
        <p style={{ color: "#9CA3AF", fontSize: 14, margin: 0 }}>Loading Jovio...</p>
      </div>
    </div>
  );
}
