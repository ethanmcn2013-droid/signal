import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { buildBriefing } from "@/lib/briefing/build";
import { getBriefingSource } from "@/lib/briefing/get-source";
import { getOrCreatePreferences } from "@/lib/preferences";
import { BriefingView } from "@/components/brief/briefing-view";
import { resolveEntitlement } from "@/lib/entitlements-shared/reads";
import { tierAtLeast } from "@/lib/entitlements-shared/tiers";

export const metadata: Metadata = {
  title: "Daily Signal, Signal",
  description: "One short morning read on what needs attention today.",
};

// /app/brief, the in-app briefing surface. Backed by
// getBriefingSource() which selects tasksDbSource when the
// Tasks read env vars are set, mockBriefingSource otherwise.
export default async function BriefPage() {
  const prefs = await getOrCreatePreferences();
  const me = await currentUser();
  const source = getBriefingSource();
  const briefing = await buildBriefing(source, {
    userId: prefs.userId,
    email: prefs.email,
  });
  const entitlement = await resolveEntitlement(prefs.userId);
  const emailDispatchEnabled = tierAtLeast(entitlement.tier, "workspace");

  return (
    <>
      <BriefingView briefing={briefing} firstName={me?.firstName ?? null} />
      {!emailDispatchEnabled ? (
        <aside
          role="note"
          style={{
            maxWidth: 640,
            margin: "32px auto 16px",
            padding: "12px 18px",
            border: "1px solid var(--border-soft)",
            borderRadius: 10,
            background: "var(--bg-deep, #f4f4f5)",
            color: "var(--ink-soft)",
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          Your briefing is here.{" "}
          <a
            href="https://signalstudio.ie/pricing"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--ink)",
              textDecoration: "underline",
              textUnderlineOffset: 2,
            }}
          >
            Get it in your inbox each morning
          </a>{" "}
         , €12/month.
        </aside>
      ) : null}
    </>
  );
}
