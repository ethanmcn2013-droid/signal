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

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com https://clerk.accounts.dev https://*.clerk.accounts.dev`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  `connect-src 'self' https://va.vercel-scripts.com https://*.clerk.accounts.dev https://accounts.clerk.com`,
  `frame-src 'self' https://*.clerk.accounts.dev`,
  `worker-src 'self' blob:`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
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
