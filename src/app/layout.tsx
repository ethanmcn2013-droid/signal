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
  // D4 Layer-0 instant canvas: tells the browser to paint white before
  // any CSS resolves. Kills the browser-default grey void on cross-origin
  // first load. LOADING_SYSTEM.md §2.
  themeColor: "#ffffff",
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
        // D4 Layer-0 instant canvas: these inline attributes fire before any
        // stylesheet resolves. background:#fff kills the browser-default grey
        // on cross-origin first load. colorScheme:light prevents the UA from
        // painting a dark-mode void even when the OS is in dark mode.
        // LOADING_SYSTEM.md §2 — "Frame 1 of every cross-origin destination
        // is paper white field, no content."
        style={{ background: "#fff", colorScheme: "light" }}
      >
        <head>
          {/* RW-5 Layer-0 pre-paint primitive — ARCH_SPEC §3, CREATIVE_SPEC §3.
              Two synchronous inlines that fire before any linked stylesheet
              or script resolves. Together they kill the dark frame on every
              cross-origin hop:
              1. <style>: white field on html + body; body::before = full-screen
                 white overlay (z:9998); body::after = centred 12px #4f46e5 dot
                 (z:9999). All literals — no var(), no em, no JS. Identical
                 across all 5 repos so the dot appears at the same coords on
                 both sides of a cross-origin hop → perceptually continuous.
                 globals.css overrides body::before/after to content:none once
                 the stylesheet loads, handing off to SuiteLoader.
              2. <script>: reads sessionStorage key `signal_dot_nav`. If set,
                 clears it and marks <html data-dot-landing="1"> so that the
                 dot-land @keyframes in globals.css fires on the wordmark period.
          */}
          {/* eslint-disable-next-line react/no-danger */}
          <style dangerouslySetInnerHTML={{ __html: "html,body{background:#fff}" }} />
        </head>
        <body
          className="min-h-full flex flex-col"
          // D4 — inline style on body: same reason as html above.
          // background:#fff fires before the stylesheet link resolves,
          // removing the grey void on cross-origin first paint.
          style={{ background: "#fff" }}
        >
          <SiteNavConditional />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
