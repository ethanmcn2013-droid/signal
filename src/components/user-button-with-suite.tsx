"use client";

import { UserButton } from "@clerk/nextjs";
import {
  ANALYTICS_URL,
  NOTES_URL,
  ROADMAP_URL,
  TASKS_URL,
} from "@/lib/product-urls";

type ProductSlug = "tasks" | "roadmap" | "notes" | "analytics";

// §14 app-context labels (locked verb for analytics: "Open the briefing")
const PRODUCTS: { slug: ProductSlug; label: string; url: string }[] = [
  { slug: "tasks",     label: "Open the workspace",  url: `${TASKS_URL}/app` },
  { slug: "roadmap",   label: "Open the roadmap",    url: `${ROADMAP_URL}/app` },
  { slug: "notes",     label: "Open the notebook",   url: `${NOTES_URL}/app` },
  { slug: "analytics", label: "Open the briefing",   url: `${ANALYTICS_URL}/app` },
];

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17L17 7M17 7H8M17 7v9" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/**
 * Clerk UserButton with:
 *   - Notification settings link
 *   - §14 app-context labels for sibling products (deep-links to /app entries)
 *   - "View public site" escape hatch — sets signal_preview_public cookie
 *     and reloads, suppressing the M→app redirect for the tab session.
 *   - When in preview mode: "Exit preview" replaces "View public site"
 */
export function UserButtonWithSuite({ current }: { current: ProductSlug }) {
  // Detect preview mode at render time (cookie-based, not sessionStorage,
  // so it's readable from JS even on server-rendered pages).
  const isPreview =
    typeof document !== "undefined" &&
    document.cookie.split(";").some((c) => c.trim() === "signal_preview_public=1");

  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link
          label="Notification settings"
          href="/app/settings/notifications"
          labelIcon={<GearIcon />}
        />
        {/* §14 L3 — escape hatch: owner can demo public marketing while logged in */}
        <UserButton.Action
          label={isPreview ? "Exit preview" : "View public site"}
          labelIcon={<EyeIcon />}
          onClick={() => {
            if (isPreview) {
              document.cookie =
                "signal_preview_public=; path=/; max-age=0; SameSite=Strict";
              sessionStorage.removeItem("signal_preview_public");
            } else {
              document.cookie =
                "signal_preview_public=1; path=/; max-age=86400; SameSite=Strict";
              sessionStorage.setItem("signal_preview_public", "1");
            }
            window.location.href = "/";
          }}
        />
        {/* Sibling products (app entry deep-links, skip current) */}
        {PRODUCTS.filter((p) => p.slug !== current).map((p) => (
          <UserButton.Link
            key={p.slug}
            label={p.label}
            href={p.url}
            labelIcon={<ArrowIcon />}
          />
        ))}
      </UserButton.MenuItems>
    </UserButton>
  );
}
