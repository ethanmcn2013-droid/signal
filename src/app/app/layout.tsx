import { SuiteSwitcher } from "@/components/suite-switcher-pills";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";

/**
 * Authenticated app chrome for Signal.
 *
 * §14 persistent top chrome — pixel-identical across all five products:
 *   Left:  signal studio. / analytics  (breadcrumb — umbrella wordmark + product mark)
 *   Right: Products switcher (authed mode, app deep-links) + Clerk UserButton
 *
 * Height h-14 (56px), sticky top-0, z-40, backdrop-blur-md.
 * Background: color-mix(in srgb, var(--bg) 85%, transparent).
 * Max-width 80rem, px-6 padding.
 *
 * Perceived continuity: a cross-product jump swaps the body; the chrome
 * appears not to move. This is NOT a true SPA — hard document navigation
 * still occurs between subdomains (no-monorepo + no-DB-merge locked).
 *
 * Note: SiteNavConditional in root layout.tsx hides the marketing SiteNav
 * when pathname starts with /app — so there is no double-nav here.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}
    >
      {/*
        §14 persistent chrome.
        z-40 (spec) — one level below Clerk modal overlays (z-50+).
        backdrop-blur-md = saturate(160%) blur(12px) in this system.
      */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "color-mix(in srgb, var(--bg) 85%, transparent)",
          backdropFilter: "saturate(160%) blur(12px)",
          WebkitBackdropFilter: "saturate(160%) blur(12px)",
          borderBottomColor: "var(--border-soft)",
        }}
      >
        <div className="mx-auto flex h-14 w-full max-w-[80rem] items-center justify-between px-6">

          {/* Left slot — §14 (amended 2026-05-19): umbrella anchor (once)
              + always-visible 4-product pill switcher. The active pill is
              the product-you-are-in indicator (no separate breadcrumb). */}
          <div className="flex min-w-0 items-center">
            <SuiteSwitcher current="analytics" />
          </div>

          {/* Right slot — account menu */}
          <UserButtonWithSuite current="analytics" />
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}
