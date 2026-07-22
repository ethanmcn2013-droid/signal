import type { NextConfig } from "next";

/**
 * ── Security headers ───────────────────────────────────────────────
 * Suite-wide baseline — matches Studio/Roadmap/Tasks pattern (Plan 4.1).
 *   1. Standard headers (HSTS, X-Frame-Options, etc.) in enforce mode.
 *   2. Content-Security-Policy in Report-Only mode — promote to enforce
 *      once verified clean.
 *
 * Analytics-specific allowances vs Studio CSP:
 *   - Clerk (auth) hosts
 *
 * Server-side calls (Resend, Turso) don't need CSP entries — only
 * browser-originated network does.
 */

const isDev = process.env.NODE_ENV === "development";
const enforceCsp = process.env.SIGNAL_ENFORCE_CSP === "true";

// CSP allowlists mirrored from notes/next.config.ts (suite-locked enforce model). Report-Only until cross-suite verification — see audit/ISSUES.md suite-01.
// Clerk's prod Frontend API is a CNAME under our own domain, so the
// wildcard `https://*.signalstudio.ie` covers whatever label Clerk
// uses without a deploy-time guess. *.clerk.com + clerk-telemetry.com
// cover Clerk infra/telemetry; Turnstile bot-protection on Cloudflare.
// Resend stays server-side (no browser-origin network), so no CSP
// entry — preserved here as the existing comment notes.
const clerkHosts =
  "https://*.signalstudio.ie https://*.clerk.accounts.dev https://*.clerk.com https://clerk-telemetry.com";
const turnstile = "https://challenges.cloudflare.com";

const googleTag = "https://www.googletagmanager.com";
const googleAnalytics =
  "https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com";

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com ${clerkHosts} ${turnstile} https://clerk.accounts.dev https://*.sentry.io ${googleTag}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  `connect-src 'self' https://va.vercel-scripts.com ${clerkHosts} https://accounts.clerk.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io ${googleTag} ${googleAnalytics}`,
  `frame-src 'self' ${turnstile}`,
  `worker-src 'self' blob:`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
  // CSP violation reporting — collected at /api/csp-report so we can verify
  // the policy is clean before promoting Report-Only → enforce.
  `report-uri /api/csp-report`,
  `report-to csp`,
].join("; ");

const securityHeaders = [
  { key: enforceCsp ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only", value: csp },
  { key: "Reporting-Endpoints", value: 'csp="/api/csp-report"' },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  experimental: {
    // Tree-shake heavy barrel imports — Clerk is used in 20 files across
    // the briefing + onboarding + marketing; the full barrel ships ~6×
    // what we call. Roadmap/Tasks/Notes carry the same shape (Phase 6.2).
    optimizePackageImports: ["@clerk/nextjs", "motion"],
  },
  // Stage C — traffic convergence into the unified app (tasks.signalstudio.ie).
  // The authed Signal surface now lives at /app/brief in the unified app.
  // /app/settings/account stays served here (GDPR — MIGRATION-P08-007).
  // Never-retire routes (/u/:token, /api/unsubscribe/:token), marketing and
  // /api are untouched (all sources below are under /app).
  async redirects() {
    return [
      {
        source: "/app",
        destination: "https://tasks.signalstudio.ie/app/brief",
        permanent: true,
      },
      {
        source: "/app/brief",
        destination: "https://tasks.signalstudio.ie/app/brief",
        permanent: true,
      },
      {
        source: "/app/overview",
        destination: "https://tasks.signalstudio.ie/app/brief",
        permanent: true,
      },
      {
        source: "/app/trends",
        destination: "https://tasks.signalstudio.ie/app/brief",
        permanent: true,
      },
      {
        source: "/app/preview-email",
        destination: "https://tasks.signalstudio.ie/app/brief",
        permanent: true,
      },
      {
        source: "/app/onboarding",
        destination: "https://tasks.signalstudio.ie/app/brief/onboarding",
        permanent: true,
      },
      {
        source: "/app/settings",
        destination: "https://tasks.signalstudio.ie/app/brief",
        permanent: true,
      },
      {
        source: "/app/settings/notifications",
        destination:
          "https://tasks.signalstudio.ie/app/brief/settings/notifications",
        permanent: true,
      },
      // Marketing → umbrella (1:1 where it exists, else the umbrella home).
      // /u/:token, /api/unsubscribe and /sign-in are NOT matched here.
      { source: "/", destination: "https://signalstudio.ie/", permanent: true },
      { source: "/about", destination: "https://signalstudio.ie/about", permanent: true },
      { source: "/pricing", destination: "https://signalstudio.ie/pricing", permanent: true },
      { source: "/changelog", destination: "https://signalstudio.ie/changelog", permanent: true },
      { source: "/security", destination: "https://signalstudio.ie/security", permanent: true },
      { source: "/privacy", destination: "https://signalstudio.ie/privacy", permanent: true },
      { source: "/terms", destination: "https://signalstudio.ie/terms", permanent: true },
      { source: "/waitlist", destination: "https://signalstudio.ie/waitlist", permanent: true },
      { source: "/law", destination: "https://signalstudio.ie/", permanent: true },
      { source: "/method", destination: "https://signalstudio.ie/", permanent: true },
      { source: "/refusals", destination: "https://signalstudio.ie/", permanent: true },
      { source: "/demo", destination: "https://signalstudio.ie/", permanent: true },
      { source: "/signal", destination: "https://signalstudio.ie/", permanent: true },
      { source: "/wedding-planning", destination: "https://signalstudio.ie/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
