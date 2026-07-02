import { auth } from "@clerk/nextjs/server";
import { isDemoMode } from "@/lib/access-mode";
import { SiteNavConditionalClient } from "./site-nav-conditional-client";

/**
 * Server component wrapper for the marketing SiteNav.
 *
 * Reads Clerk auth state server-side and passes isAuthed down to the
 * client path-check component. This keeps the nav hidden inside /app/*
 * while giving SiteNav the auth context it needs to kill the false
 * "Request access" CTA and mount the account menu when the user is signed in.
 *
 * L3 compliance: when isAuthed, SiteNav renders no "Sign in" / "Request
 * access" / "Start for free" strings — those strings make an authenticated
 * user feel logged out (§14 Kill the false "Sign in").
 */
export async function SiteNavConditional() {
  const { userId } = isDemoMode() ? { userId: null } : await auth();
  return <SiteNavConditionalClient isAuthed={Boolean(userId)} />;
}
