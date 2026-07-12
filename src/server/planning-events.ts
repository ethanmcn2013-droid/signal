import { db } from "@/server/db";
import { planningEvents } from "@/server/db/schema";

export type PlanningEvent = {
  eventName: "signal_scope_changed" | "period_signal_viewed";
  scopeKind: "workspace" | "planningPeriod";
  workspaceCount: number;
};

export async function recordPlanningEvent(event: PlanningEvent): Promise<void> {
  const safeCount = Math.max(0, Math.min(50, Math.floor(event.workspaceCount)));
  try {
    await db.insert(planningEvents).values({
      id: `pev_${crypto.randomUUID().replaceAll("-", "")}`,
      eventName: event.eventName,
      scopeKind: event.scopeKind,
      workspaceCount: safeCount,
    });
  } catch {
    // Analytics is never load-bearing for the briefing or scope change.
  }
}
