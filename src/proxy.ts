import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/access-mode";

// ─── Layer 2: M→app redirect ────────────────────────────────────────────────
//
// Category M — marketing routes. An authenticated user on any of these is
// shown the app/briefing instead. Unauthed users get the marketing page as
// normal. The set is an explicit allowlist per Layer 0 route spec (never a
// "catch everything public" heuristic).
//
// Category C (/wedding-planning and future shared briefings) is intentionally
// ABSENT from this set. A prospect or logged-in colleague opening a shared
// briefing link MUST see the briefing — bouncing them is the single worst
// failure mode. C routes are never redirected, never auth-gated.
//
// Category A (/app/*) is never redirected — it's already the destination.
// Category X (/api/*, /og/*, cron, /sign-in, /sign-up) is never touched.
const MARKETING_PATHS = new Set([
  "/",
  "/signal",
  "/method",
  "/pricing",
  "/about",
]);

const APP_ENTRY = "/app";

// Anything under /app/* requires sign-in.
// /u/[token] and /api/unsubscribe/[token] are intentionally public —
// the whole point of one-click unsubscribe is no auth wall.
const isProtectedRoute = createRouteMatcher(["/app(.*)"]);

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
);

export default clerkMiddleware(async (auth, req) => {
  // Demo/Review: /app/* is publicly reachable; the briefing renders from the
  // in-memory mock signals (no DB, no Clerk). Production path below unchanged.
  // Flip SIGNAL_ACCESS_MODE back to production to restore the gate.
  if (isDemoMode()) return;

  const { pathname } = req.nextUrl;

  // ── L2: M→app redirect (runs before Clerk protect) ──────────────────────
  // Only fire on explicit M routes. C, A, and X pass through untouched.
  if (MARKETING_PATHS.has(pathname)) {
    // §14 escape-hatch: owner sets signal_preview_public cookie or
    // ?preview=public to demo public marketing while logged in.
    const isPreview =
      req.cookies.get("signal_preview_public")?.value === "1" ||
      req.nextUrl.searchParams.get("preview") === "public";

    // Use the REAL Clerk session (userId), not raw __session cookie presence.
    // A stale/expired cookie otherwise 307s a signed-out visitor to /app and
    // walls them at /sign-in ("forced sign-in unless incognito"). Genuine
    // sessions still redirect to the app.
    const { userId } = await auth();
    const isAuthed = Boolean(userId);

    if (isAuthed && !isPreview) {
      // 307 Temporary Redirect — preserves method, signals the client this
      // URL is still canonical (not a permanent move).
      return NextResponse.redirect(new URL(APP_ENTRY, req.url), 307);
    }
  }

  // ── Clerk protect: /app/* requires sign-in ───────────────────────────────
  if (isProtectedRoute(req)) {
    if (!clerkConfigured) {
      // Fail CLOSED in production. A prod deploy missing Clerk keys must
      // not serve /app unauthenticated. Locally we pass through so dev
      // runs before keys are provisioned.
      if (process.env.NODE_ENV === "production") {
        return new NextResponse("Authentication is not configured.", {
          status: 503,
        });
      }
      return;
    }
    // Redirect to sign-in rather than the Clerk default (404). The
    // pricing page advertises Signal; sending unsigned-in clickers
    // to a 404 with no path forward is hostile. Matches Notes pattern.
    await auth.protect({
      unauthenticatedUrl: new URL("/sign-in", req.url).toString(),
    });
  }
});

export const config = {
  matcher: [
    // Skip Next internals and all static assets, unless found in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
