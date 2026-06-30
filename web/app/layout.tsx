import type { Metadata, Viewport } from "next";
import "./globals.css";
import CookieBanner from "../components/CookieBanner";

export const metadata: Metadata = {
  metadataBase: new URL("https://jovio.in"),
  title: "Jovio — Telugu AI Receptionist for Indian Businesses",
  description: "Your business never misses a call. Jovio answers in Telugu, books appointments, sends WhatsApp confirmations — 24/7.",
  keywords: "Telugu AI, voice agent, receptionist, India, SMB, automation, WhatsApp, AI",
  authors: [{ name: "Jovio Global Technologies" }],
  alternates: {
    canonical: "https://jovio.in",
  },
  openGraph: {
    title: "Jovio — Telugu AI Receptionist",
    description: "Your business never misses a call. 24/7 Telugu AI receptionist for Indian SMBs.",
    url: "https://jovio.in",
    siteName: "Jovio",
    locale: "en_IN",
    type: "website",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Jovio — Telugu AI Receptionist",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jovio — Telugu AI Receptionist",
    description: "Your business never misses a call.",
    images: ["/og-image.png"],
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
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
