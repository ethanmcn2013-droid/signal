import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { buildBriefing } from "@/lib/briefing/build";
import { mockBriefingSource } from "@/lib/briefing/mock-source";
import { BriefingView } from "@/components/brief/briefing-view";

export const metadata: Metadata = {
  title: "Daily Signal — Signal Analytics",
  description: "One short morning read on what needs attention today.",
};

// /app/brief — the in-app briefing surface. Phase B.1: backed by
// mockBriefingSource (Wedding 2026 demo data). Phase B.2 swaps for
// a real Tasks DB read by replacing the source in one line.
export default async function BriefPage() {
  const { userId } = await auth();
  if (!userId) {
    // Middleware should prevent this, but render a clear message in case.
    return (
      <main className="mx-auto max-w-[640px] px-6 py-16">
        <p>Not signed in.</p>
      </main>
    );
  }

  const briefing = await buildBriefing(mockBriefingSource, userId);

  return (
    <>
      <BriefingView briefing={briefing} />
      <div
        className="mx-auto mb-12 max-w-[640px] px-6 text-[11px]"
        style={{ color: "var(--ink-quiet)" }}
      >
        Phase B.1 — engine output rendered from mock Wedding 2026 source.
        Phase B.2 wires this to your live Tasks workspace.
      </div>
    </>
  );
}
