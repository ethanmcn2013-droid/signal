"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { SuiteLauncher } from "@/components/suite-launcher";
import { UserButton } from "@clerk/nextjs";

const NAV: { href: string; label: string; external?: boolean }[] = [
  { href: "/signal",   label: "Signal"  },
  { href: "/method",   label: "Method"  },
  { href: "/pricing",  label: "Pricing" },
  { href: "/about",    label: "About"   },
];

/**
 * Sets the signal_preview_public cookie and reloads to suppress the M→app
 * redirect for this tab session. Owner-only escape hatch per §14.
 */
function activatePreviewMode() {
  document.cookie =
    "signal_preview_public=1; path=/; max-age=86400; SameSite=Strict";
  sessionStorage.setItem("signal_preview_public", "1");
  window.location.reload();
}

/**
 * Clears the signal_preview_public cookie and reloads to re-enable the
 * M→app redirect. Shown when the escape hatch is active.
 */
function exitPreviewMode() {
  document.cookie =
    "signal_preview_public=; path=/; max-age=0; SameSite=Strict";
  sessionStorage.removeItem("signal_preview_public");
  window.location.reload();
}

export function SiteNav({ isAuthed = false }: { isAuthed?: boolean }) {
  const pathname = usePathname();

  // Check if the escape hatch cookie is currently active so we can show
  // "Exit preview" instead of "View public site".
  const isPreviewActive =
    typeof document !== "undefined" &&
    document.cookie.split(";").some((c) => c.trim() === "signal_preview_public=1");

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: "color-mix(in srgb, var(--bg) 85%, transparent)",
        backdropFilter: "saturate(160%) blur(12px)",
        WebkitBackdropFilter: "saturate(160%) blur(12px)",
        borderBottomColor: "var(--border-soft)",
      }}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center justify-between px-6">

        <div className="flex items-center" style={{ gap: 12 }}>
          <div className="hidden sm:inline-flex">
            {/* §14 L3: authed mode shows app deep-links; unauthed shows marketing taglines */}
            <SuiteLauncher current="analytics" isAuthed={isAuthed} />
          </div>
          <span aria-hidden className="hidden sm:inline" style={{ color: "var(--ink-faint)", fontSize: 12 }}>/</span>
          <Wordmark size="md" />
        </div>

        {/* Desktop nav — right cluster */}
        <nav className="hidden items-center md:flex" style={{ gap: 28 }}>
          {NAV.map((item) => {
            const active = !item.external && pathname === item.href;
            const linkStyle: React.CSSProperties = {
              fontSize: 13.5,
              color: active ? "var(--ink)" : "var(--ink-soft)",
              fontWeight: active ? 600 : 400,
              textDecoration: "none",
              transition: "color var(--motion-fast)",
            };
            return item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} style={linkStyle}>
                {item.label}
              </Link>
            );
          })}

          {/* Unauthed: Sign in is a visible affordance, never a gate — public
              scanning stays open (canonical product header, DESIGN.md §14). */}
          {!isAuthed && (
            <Link
              href="/sign-in"
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium hover:text-ink"
              style={{ color: "var(--ink-soft)", transition: "color var(--motion-fast)" }}
            >
              Sign in
            </Link>
          )}

          {/* §14 L3: authed users get account + preview controls; no upper CTA. */}
          {isAuthed && (
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
                    transition: "border-color var(--motion-fast)",
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
                    transition: "color var(--motion-fast)",
                  }}
                  title="View public site (owner escape hatch)"
                >
                  View public site
                </button>
              )}
              <UserButton />
            </div>
          )}
        </nav>

        {/* Mobile nav — native <details> for restraint */}
        <details className="relative md:hidden">
          <summary
            className="cursor-pointer list-none transition-colors"
            style={{
              fontSize: 13,
              color: "var(--ink-soft)",
              userSelect: "none",
            }}
          >
            Menu
          </summary>
          <div
            className="absolute right-0 top-8 min-w-[160px] py-2"
            style={{
              borderRadius: "var(--r-3)",
              border: "1px solid var(--border-soft)",
              boxShadow: "var(--shadow-2)",
              background: "var(--bg-elev)",
              zIndex: 50,
            }}
          >
            {NAV.map((item) => {
              const active = !item.external && pathname === item.href;
              const linkStyle: React.CSSProperties = {
                fontSize: 13.5,
                color: active ? "var(--ink)" : "var(--ink-soft)",
                fontWeight: active ? 600 : 400,
                textDecoration: "none",
                transition: "color var(--motion-fast)",
              };
              return item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2"
                  style={linkStyle}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2"
                  style={linkStyle}
                >
                  {item.label}
                </Link>
              );
            })}
            {isAuthed ? (
              <div className="px-4 py-2">
                <UserButton />
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="block px-4 py-2"
                style={{ fontSize: 13.5, color: "var(--ink-soft)", textDecoration: "none" }}
              >
                Sign in
              </Link>
            )}
          </div>
        </details>
      </div>
    </header>
  );
}
