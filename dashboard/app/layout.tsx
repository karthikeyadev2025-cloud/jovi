import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jovio Dashboard — Telugu AI Receptionist",
  description: "Manage your Jovio voice profiles, view live calls, appointments, and analytics.",
  icons: {
    icon: "/jovio-logo.jpeg",
    apple: "/jovio-logo.jpeg",
  },
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
