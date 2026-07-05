import { SiteFooter } from "@/components/marketing/site-footer";

/**
 * Marketing route-group layout. Wraps every public page in the
 * cross-product nav + 4-column footer. The /app surface (signed-in
 * briefing) lives outside this group and uses its own chrome —
 * see src/app/app/layout.tsx.
 *
 * R4 (ux-remediation-2026-05-17): SiteNav removed here, the root
 * layout mounts SiteNavConditional which already renders SiteNav on
 * every non-/app route. Having both produced two stacked navbars on
 * all marketing and sample-briefing pages.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
