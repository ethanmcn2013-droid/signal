"use client";

import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { isDemoMode } from "@/lib/access-mode";
import {
  SIGNAL_URL,
  NOTES_URL,
  TIMELINE_URL,
  TASKS_URL,
} from "@/lib/product-urls";

type ProductSlug = "tasks" | "roadmap" | "notes" | "analytics";

// §1G canonical labels (lowercase product noun). §1I order: notes→tasks→roadmap→analytics.
const PRODUCTS: { slug: ProductSlug; label: string; url: string }[] = [
  { slug: "notes",     label: "Open notes",     url: `${NOTES_URL}/app` },
  { slug: "tasks",     label: "Open tasks",     url: `${TASKS_URL}/app` },
  { slug: "roadmap",   label: "Open timeline",   url: `${TIMELINE_URL}/app` },
  { slug: "analytics", label: "Open signal", url: `${SIGNAL_URL}/app` },
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

function CameraIcon() {
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
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

/**
 * Clerk UserButton with:
 *   - Notification settings link
 *   - §14 app-context labels for sibling products (deep-links to /app entries)
 *   - "View public site" escape hatch, sets signal_preview_public cookie
 *     and reloads, suppressing the M→app redirect for the tab session.
 *   - When in preview mode: "Exit preview" replaces "View public site"
 */
function DemoUserButtonWithSuite({ current }: { current: ProductSlug }) {
  return (
    <details className="group relative">
      <summary
        aria-label="Open demo account menu"
        className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-full bg-[color:var(--ink)] text-[11px] font-semibold text-white outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)] [&::-webkit-details-marker]:hidden"
      >
        DO
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-[color:var(--border)] bg-white p-1.5 shadow-[0_24px_60px_-24px_rgba(20,21,26,0.18)]">
        <p className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--ink-quiet)]">
          Demo operator
        </p>
        {PRODUCTS.filter((product) => product.slug !== current).map(
          (product) => (
            <a
              key={product.slug}
              href={product.url}
              className="flex min-h-11 items-center justify-between rounded-lg px-2.5 text-sm text-[color:var(--ink)] hover:bg-[color:var(--bg-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
            >
              {product.label}
              <ArrowIcon />
            </a>
          ),
        )}
      </div>
    </details>
  );
}

function ClerkUserButtonWithSuite({ current }: { current: ProductSlug }) {
  // Detect preview mode at render time (cookie-based, not sessionStorage,
  // so it's readable from JS even on server-rendered pages).
  const isPreview =
    typeof document !== "undefined" &&
    document.cookie.split(";").some((c) => c.trim() === "signal_preview_public=1");

  // Item 4: detect whether user has uploaded a custom avatar.
  // Clerk API: useUser() → user.hasImage; useClerk() → openUserProfile().
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const hasPhoto = user?.hasImage ?? true; // default true → no flicker on load

  return (
    <UserButton>
      <UserButton.MenuItems>
        {/* Item 4: surface avatar upload when user hasn't added a photo yet.
            Opens Clerk's built-in <UserProfile> modal (avatar on first tab). */}
        {!hasPhoto ? (
          <UserButton.Action
            label="Add a photo"
            labelIcon={<CameraIcon />}
            onClick={() => openUserProfile()}
          />
        ) : null}
        <UserButton.Action label="manageAccount" />
        <UserButton.Link
          label="Notification settings"
          href="/app/settings/notifications"
          labelIcon={<GearIcon />}
        />
        <UserButton.Link
          label="Account settings"
          href="/app/settings/account"
          labelIcon={<GearIcon />}
        />
        {/* §14 L3, escape hatch: owner can demo public marketing while logged in */}
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

export function UserButtonWithSuite({ current }: { current: ProductSlug }) {
  return isDemoMode() ? (
    <DemoUserButtonWithSuite current={current} />
  ) : (
    <ClerkUserButtonWithSuite current={current} />
  );
}
