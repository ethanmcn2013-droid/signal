"use client";

import { usePathname } from "next/navigation";
import { SiteNav } from "./site-nav";

/**
 * Client component: hides the SiteNav inside the authenticated /app shell
 * (which provides its own persistent chrome per §14) and passes auth state
 * down to SiteNav.
 *
 * Previously this was the only SiteNavConditional file and was the default
 * export. Now it's the client half, the server wrapper (site-nav-conditional.tsx)
 * resolves auth and passes isAuthed here.
 */
export function SiteNavConditionalClient({ isAuthed }: { isAuthed: boolean }) {
  const pathname = usePathname() ?? "";
  if (pathname === "/app" || pathname.startsWith("/app/")) return null;
  return <SiteNav isAuthed={isAuthed} />;
}
