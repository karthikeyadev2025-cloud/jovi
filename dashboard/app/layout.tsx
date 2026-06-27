// app/layout.tsx  — Root layout
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jovio — Telugu AI Receptionist — Jovio",
  description: "Your business never misses a call",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#07070D", color: "#EEEEFF",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
