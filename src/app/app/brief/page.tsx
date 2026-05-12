import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { buildBriefing } from "@/lib/briefing/build";
import { getBriefingSource } from "@/lib/briefing/get-source";
import { getOrCreatePreferences } from "@/lib/preferences";
import { BriefingView } from "@/components/brief/briefing-view";

export const metadata: Metadata = {
  title: "Daily Signal — Signal Analytics",
  description: "One short morning read on what needs attention today.",
};

// /app/brief — the in-app briefing surface. Backed by
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

  return (
    <BriefingView briefing={briefing} firstName={me?.firstName ?? null} />
  );
}
