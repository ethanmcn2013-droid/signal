import { Suspense } from "react";
import { SuiteSwitcher } from "@/components/suite-switcher-pills";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";
import { SuiteHeader } from "@/components/chrome/suite-header";
import { AppAccessGate } from "@/components/app-access-gate";
import AppLoading from "./loading";

/**
 * Authenticated app chrome for Signal.
 *
 * §14 persistent top chrome, pixel-identical across all five products:
 *   Left:  signal studio. / analytics  (breadcrumb, umbrella wordmark + product mark)
 *   Right: Products switcher (authed mode, app deep-links) + Clerk UserButton
 *
 * Height h-14 (56px), sticky top-0, z-40, backdrop-blur-md.
 * Background: color-mix(in srgb, var(--bg) 85%, transparent).
 * Max-width 80rem, px-6 padding.
 *
 * Perceived continuity: a cross-product jump swaps the body; the chrome
 * appears not to move. This is NOT a true SPA, hard document navigation
 * still occurs between subdomains (no-monorepo + no-DB-merge locked).
 *
 * Note: SiteNavConditional in root layout.tsx hides the marketing SiteNav
 * when pathname starts with /app, so there is no double-nav here.
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
      {/* §14 persistent chrome — the shared SuiteHeader shell (switcher
          lockup, no wordmark). One header for marketing + app. */}
      <SuiteHeader
        launcher={<SuiteSwitcher current="analytics" />}
        nav={[]}
        account={<UserButtonWithSuite current="analytics" />}
      />

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Closed-beta gate: only allowlisted accounts reach the app content
            (production only). The wordmark loader paints during the check. */}
        <Suspense fallback={<AppLoading />}>
          <AppAccessGate>{children}</AppAccessGate>
        </Suspense>
      </main>
    </div>
  );
}
