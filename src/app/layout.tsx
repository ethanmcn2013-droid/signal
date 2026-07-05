import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNavConditional } from "@/components/marketing/site-nav-conditional";
import { DevBanner } from "@/components/dev-banner";
import { clerkPublishableKey, isDemoMode } from "@/lib/access-mode";
import { SITE_URL } from "@/lib/site-url";

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
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Signal · Operational clarity. Know what needs your attention.",
  description:
    "Signal reads the state of your work and writes a short briefing. What needs you. What's moving. What's quiet. What to do next.",
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Signal · Operational clarity.",
    description: "Not a dashboard. A briefing. Know what needs your attention.",
    type: "website",
  },
};

function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteNavConditional />
      {children}
      <DevBanner />
    </>
  );
}

function AuthShell({ children }: Readonly<{ children: React.ReactNode }>) {
  if (isDemoMode()) {
    return <AppShell>{children}</AppShell>;
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey()}
      appearance={{
        variables: {
          colorPrimary: "#4f46e5",
          fontFamily: "var(--font-geist-sans)",
          borderRadius: "0.5rem",
        },
        elements: {
          formFieldInput: "!min-h-[48px] !text-[16px]",
          formButtonPrimary: "!min-h-[48px] !text-[15px]",
          socialButtonsBlockButton: "!min-h-[48px] !text-[15px]",
        },
      }}
    >
      <AppShell>{children}</AppShell>
    </ClerkProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ background: "#fff", colorScheme: "light" }}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: "html{background:#fff}" }} />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: "#fff" }}>
        {/* WCAG 2.4.1: first focusable element on the page. Lets keyboard
            and screen-reader users bypass the nav straight to the content. */}
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <AuthShell>{children}</AuthShell>
      </body>
    </html>
  );
}
