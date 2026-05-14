import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Anything under /app/* requires sign-in.
// /u/[token] and /api/unsubscribe/[token] are intentionally public —
// the whole point of one-click unsubscribe is no auth wall.
const isProtectedRoute = createRouteMatcher(["/app(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Redirect to sign-in rather than the Clerk default (404). The
    // pricing page advertises Analytics; sending unsigned-in clickers
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
