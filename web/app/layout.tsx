import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jovio — Telugu AI Receptionist",
  description: "Your business never misses a call. Telugu AI receptionist powered by Jovio Tech Labs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#07070F" }}>
        {children}
      </body>
    </html>
  );
}
