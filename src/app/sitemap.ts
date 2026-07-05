import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// The public, indexable surface of Signal. Only marketing/content routes
// belong here — the app (/app/*), unsubscribe links (/u/*), the closed-beta
// gate (/waitlist), and the auth flow (/sign-in, /sign-up) are all either
// auth-walled, tokenised, or noindex, and are disallowed in robots.ts.
//
// Kept as an explicit allowlist, not a filesystem crawl, for the same reason
// the middleware keeps MARKETING_PATHS explicit: a new private route must
// never leak into the sitemap just by existing.
//
// `priority` is a relative hint to crawlers, not a ranking lever — the home
// and product pages lead; legal/policy pages trail. `changeFrequency` mirrors
// how often each page's copy actually turns over.
type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

const ROUTES: Entry[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/signal", priority: 0.9, changeFrequency: "monthly" },
  { path: "/method", priority: 0.8, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/demo", priority: 0.7, changeFrequency: "monthly" },
  { path: "/wedding-planning", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/changelog", priority: 0.5, changeFrequency: "weekly" },
  { path: "/law", priority: 0.5, changeFrequency: "yearly" },
  { path: "/security", priority: 0.5, changeFrequency: "yearly" },
  { path: "/refusals", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified,
    changeFrequency,
    priority,
  }));
}
