import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Daily Signal, Signal",
  description: "One short morning read on what needs attention today.",
};

/**
 * One briefing path. The former /app/brief implementation bypassed the linked
 * scope and read every Tasks workspace. Preserve validated context hints while
 * canonicalizing to /app, whose orchestrator rechecks current membership.
 */
export default async function BriefPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const incoming = await searchParams;
  const outgoing = new URLSearchParams();
  if (incoming.contextVersion === "2") outgoing.set("contextVersion", "2");
  if (typeof incoming.workspaceId === "string") {
    outgoing.set("workspaceId", incoming.workspaceId);
  }
  if (typeof incoming.planningPeriodId === "string") {
    outgoing.set("planningPeriodId", incoming.planningPeriodId);
  }
  redirect(outgoing.size ? `/app?${outgoing.toString()}` : "/app");
}
