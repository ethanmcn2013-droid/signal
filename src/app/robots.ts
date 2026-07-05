import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Crawler policy for Signal. The marketing surface is open; everything that is
// auth-walled, tokenised, or private is closed so a shared briefing link or an
// unsubscribe URL can never be indexed by following a stray reference.
//
//   /app     — the signed-in product (Clerk-protected); bare, so the /app
//              entry itself is covered, not just /app/* subpaths
//   /u/      — tokenised unsubscribe landings (private per-recipient links)
//   /api     — route handlers, never a page
//   /waitlist — the closed-beta gate (also noindex at the page level)
//   /sign-in, /sign-up — the auth flow, no standalone SEO value
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app", "/u/", "/api", "/waitlist", "/sign-in", "/sign-up"],
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
    host: SITE_URL,
  };
}
