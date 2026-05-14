import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNavConditional } from "@/components/marketing/site-nav-conditional";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Signal Analytics — Operational clarity. Know what needs your attention.",
  description:
    "Signal Analytics reads the state of your work and writes a short briefing. What needs you. What's moving. What's quiet. What to do next.",
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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#4f46e5",
          fontFamily: "var(--font-geist-sans)",
          borderRadius: "0.5rem",
        },
        elements: {
          // Mobile correctness — mirrors tasks T·47 and roadmap R·1.
          formFieldInput:
            "!min-h-[48px] !text-[16px]",
          formButtonPrimary:
            "!min-h-[48px] !text-[15px]",
          socialButtonsBlockButton:
            "!min-h-[48px] !text-[15px]",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <SiteNavConditional />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
