import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Anything under /app/* requires sign-in.
// /u/[token] and /api/unsubscribe/[token] are intentionally public —
// the whole point of one-click unsubscribe is no auth wall.
const isProtectedRoute = createRouteMatcher(["/app(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
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
