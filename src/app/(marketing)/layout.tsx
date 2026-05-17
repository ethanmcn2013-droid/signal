import { SiteNav } from "@/components/marketing/site-nav";
import { SiteFooter } from "@/components/marketing/site-footer";

/**
 * Marketing route-group layout. Wraps every public page in the
 * cross-product nav + 4-column footer. The /app surface (signed-in
 * briefing) lives outside this group and uses its own chrome —
 * see src/app/app/layout.tsx.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
