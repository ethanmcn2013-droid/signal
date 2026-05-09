import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Signal Analytics — Operational clarity. Know what needs your attention.",
  description:
    "Signal Analytics turns the work happening across your team into a short briefing. What needs you. What's moving. What's quiet. What to do next.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://analytics.signalstudio.ie"
  ),
  openGraph: {
    title: "Signal Analytics — Operational clarity.",
    description:
      "Not a dashboard. A briefing. Know what needs your attention.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
