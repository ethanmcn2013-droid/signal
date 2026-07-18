import type { ErrorEvent } from "@sentry/nextjs";

/**
 * Strip PII from a Sentry event before it leaves the browser/server.
 *
 *   - user → reduced to `{id}` only (opaque Clerk userId)
 *   - request.cookies / data / query_string → dropped
 *   - request.headers → sensitive auth/session headers redacted
 *   - breadcrumbs to clerk/webhook/auth endpoints → dropped
 *
 * Pairs with `sendDefaultPii: false` on the init, together they keep
 * IP, cookies, and Clerk session tokens out of Sentry payloads.
 *
 * Ported byte-for-byte from the Tasks reference setup so PII handling
 * is identical across the suite.
 */
const REDACTED_HEADERS = new Set([
  "cookie",
  "set-cookie",
  "authorization",
  "x-forwarded-for",
  "x-real-ip",
  "stripe-signature",
]);

function isSensitiveBreadcrumbUrl(url: string): boolean {
  return (
    url.includes("clerk.") ||
    url.includes("stripe.com") ||
    url.includes("svix.com") ||
    url.includes("/api/webhooks/") ||
    url.includes("/api/auth/") ||
    /\/(?:u|share|redeem|invite|unsubscribe)\//i.test(url) ||
    /\/(?:oauth|callback)(?:\/|\?|$)/i.test(url)
  );
}

const SENSITIVE_KEY = /(?:token|secret|assertion|authorization|password|code|state)$/i;

function scrubValue(value: unknown, depth = 0): unknown {
  if (depth > 4 || value == null) return value;
  if (Array.isArray(value)) return value.map((item) => scrubValue(item, depth + 1));
  if (typeof value !== "object") return value;
  const clean: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    clean[key] = SENSITIVE_KEY.test(key) ? "[Filtered]" : scrubValue(child, depth + 1);
  }
  return clean;
}

function scrubUrl(raw: string): string {
  try {
    const url = new URL(raw, "https://redacted.invalid");
    url.pathname = url.pathname.replace(
      /\/(u|share|redeem|invite|unsubscribe)\/[^/]+/gi,
      "/$1/[Filtered]",
    );
    for (const key of Array.from(url.searchParams.keys())) {
      if (SENSITIVE_KEY.test(key)) url.searchParams.set(key, "[Filtered]");
    }
    return raw.startsWith("http") ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "[Filtered URL]";
  }
}

export function scrubEvent(
  event: ErrorEvent,
): ErrorEvent | null {
  if (event.user) {
    event.user = event.user.id ? { id: event.user.id } : undefined;
  }

  const req = event.request;
  if (req) {
    delete req.cookies;
    delete req.data;
    delete req.query_string;
    if (req.url) req.url = scrubUrl(req.url);
    if (req.headers) {
      const filtered: Record<string, string> = {};
      for (const [k, v] of Object.entries(req.headers)) {
        const key = k.toLowerCase();
        if (REDACTED_HEADERS.has(key) || key.startsWith("x-clerk-") || key.startsWith("svix-")) {
          continue;
        }
        if (typeof v === "string") filtered[k] = v;
      }
      req.headers = filtered;
    }
  }

  if (event.tags) event.tags = scrubValue(event.tags) as typeof event.tags;
  if (event.extra) event.extra = scrubValue(event.extra) as typeof event.extra;
  if (event.contexts) event.contexts = scrubValue(event.contexts) as typeof event.contexts;

  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.filter((b) => {
      const url = (b.data?.url as string | undefined) ?? "";
      if (isSensitiveBreadcrumbUrl(url)) return false;
      if (b.data) {
        b.data = scrubValue(b.data) as typeof b.data;
        if (typeof b.data.url === "string") b.data.url = scrubUrl(b.data.url);
      }
      return true;
    });
  }

  return event;
}
