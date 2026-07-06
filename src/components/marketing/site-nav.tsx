"use client";

import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { SuiteLauncher } from "@/components/suite-launcher";
import { SuiteHeader, type SuiteNavItem } from "@/components/chrome/suite-header";
import { UserButton } from "@clerk/nextjs";

// One header contract (product-header-contract.md, 2026-07-06): the marketing
// header nav is exactly Pricing · Design, both umbrella links. Ten rules,
// Refusals, About and the self-link stay reachable from the footer and body.
const UMBRELLA_PRICING = "https://signalstudio.ie/pricing";
const UMBRELLA_DESIGN = "https://signalstudio.ie/design";

const NAV: SuiteNavItem[] = [
  { href: UMBRELLA_PRICING, label: "Pricing", external: true },
  { href: UMBRELLA_DESIGN, label: "Design", external: true },
];

/** §14 owner escape hatch: suppress the M→app redirect for this tab session. */
function activatePreviewMode() {
  document.cookie =
    "signal_preview_public=1; path=/; max-age=86400; SameSite=Strict";
  sessionStorage.setItem("signal_preview_public", "1");
  window.location.reload();
}
function exitPreviewMode() {
  document.cookie =
    "signal_preview_public=; path=/; max-age=0; SameSite=Strict";
  sessionStorage.removeItem("signal_preview_public");
  window.location.reload();
}

/**
 * Signal marketing header — a thin wrapper over the shared SuiteHeader shell.
 * The account slot carries the §14 auth-aware controls (Sign in, account
 * menu, and the owner preview escape hatch); the shell, lockup, nav, and
 * mobile menu are the one shared component.
 */
export function SiteNav({ isAuthed = false }: { isAuthed?: boolean }) {
  const isPreviewActive =
    typeof document !== "undefined" &&
    document.cookie.split(";").some((c) => c.trim() === "signal_preview_public=1");

  return (
    <SuiteHeader
      launcher={<SuiteLauncher current="analytics" isAuthed={isAuthed} />}
      wordmark={<Wordmark size="md" />}
      nav={NAV}
      account={
        isAuthed ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isPreviewActive ? (
              <button
                type="button"
                onClick={exitPreviewMode}
                style={{
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  fontWeight: 500,
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: 999,
                  padding: "4px 11px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Exit preview
              </button>
            ) : (
              <button
                type="button"
                onClick={activatePreviewMode}
                style={{
                  fontSize: 12,
                  color: "var(--ink-faint)",
                  fontWeight: 400,
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                title="View public site (owner escape hatch)"
              >
                View public site
              </button>
            )}
            <UserButton />
          </div>
        ) : (
          <Link
            href="/sign-in"
            className="inline-flex min-h-8 items-center rounded-full px-3.5 text-[13px] font-medium"
            style={{ color: "var(--ink-soft)", transition: "color 140ms ease" }}
          >
            Sign in
          </Link>
        )
      }
    />
  );
}
