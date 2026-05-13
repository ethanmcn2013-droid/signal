"use client";

import { usePathname } from "next/navigation";
import { SiteNav } from "./site-nav";

/**
 * Render the marketing SiteNav everywhere EXCEPT inside the authenticated
 * /app shell, which provides its own chrome (SuiteLauncher + user button).
 * Mounting this in the root layout gives every public route a consistent
 * header without each page having to import SiteNav manually.
 */
export function SiteNavConditional() {
  const pathname = usePathname() ?? "";
  if (pathname === "/app" || pathname.startsWith("/app/")) return null;
  return <SiteNav />;
}
