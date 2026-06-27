import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jovio — Telugu AI Receptionist for Indian Businesses",
  description: "Your business never misses a call. Jovio answers in Telugu, books appointments, sends WhatsApp confirmations — 24/7.",
  keywords: "Telugu AI, voice agent, receptionist, India, SMB, automation, WhatsApp, AI",
  authors: [{ name: "Jovio Global Technologies" }],
  icons: {
    icon: "/jovio-logo.jpeg",
    apple: "/jovio-logo.jpeg",
  },
  openGraph: {
    title: "Jovio — Telugu AI Receptionist",
    description: "Your business never misses a call. 24/7 Telugu AI receptionist for Indian SMBs.",
    url: "https://jovio.in",
    siteName: "Jovio",
    images: [{ url: "/jovio-logo.jpeg", width: 1200, height: 630, alt: "Jovio" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jovio — Telugu AI Receptionist",
    description: "Your business never misses a call.",
    images: ["/jovio-logo.jpeg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#070B19",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
