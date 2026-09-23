import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkočDál — Klientský briefing",
  description: "Briefing pro Brand DNA, nový web a další posun vaší firmy.",
  icons: { icon: "/logo-symbol.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
