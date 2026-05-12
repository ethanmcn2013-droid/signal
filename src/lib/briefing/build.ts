import { phraseFor } from "./prose";
import type { BriefingContext, BriefingSource } from "./source";
import {
  detectBlockedTooLong,
  detectCrowdedWeek,
  detectDueSoon,
  detectJustShipped,
  detectOverload,
  detectStuckWork,
  type Triggered,
} from "./triggers";
import type { BriefItem, Briefing, FocusItem, TriggerKind } from "./types";

const BUCKET_CAP = 3;
const DAY = 86_400_000;

/**
 * The engine. Pure function over a BriefingSource. Same inputs →
 * same brief on the same day; rotation index advances per day so
 * prose phrasings don't repeat two days in a row.
 */
export async function buildBriefing(
  source: BriefingSource,
  ctx: BriefingContext,
  now: number = Date.now(),
): Promise<Briefing> {
  const signals = await source.getSignalsForUser(ctx);
  const userId = ctx.userId;

  const stuck = detectStuckWork(signals);
  const dueSoon = detectDueSoon(signals, now);
  const shipped = detectJustShipped(signals, now);
  const overload = detectOverload(signals);
  const crowded = detectCrowdedWeek(signals, now);
  const blocked = detectBlockedTooLong(signals);

  const rotationIndex = dayRotation(userId, now);

  // ─ Needs attention: due-soon (incl. overdue) + overload + crowded-week,
  // ordered by severity. The week-cluster signal lands here because it's
  // load-this-week, not background.
  const attention = pickTop(
    [...dueSoon, ...overload, ...crowded].sort(
      (a, b) => b.severity - a.severity,
    ),
    BUCKET_CAP,
  );

  // ─ Moving well: just-shipped, ordered by recency.
  const moving = pickTop(
    [...shipped].sort(
      (a, b) =>
        (b.task.movedToShippedAt ?? 0) - (a.task.movedToShippedAt ?? 0),
    ),
    BUCKET_CAP,
  );

  // ─ Quiet risks: stuck-work, ordered by severity, EXCLUDING items
  // already in attention (so a stuck-work item that's also overdue
  // appears once, in attention, not twice).
  const usedIds = new Set([
    ...attention.map((t) => t.task.id),
    ...moving.map((t) => t.task.id),
  ]);
  // Quiet risks: stuck-work + blocked-too-long, severity-sorted,
  // excluding anything already in attention or moving. blocked-too-long
  // lives here because it's about a long-tail issue, not today's load.
  const risks = pickTop(
    [...stuck, ...blocked]
      .filter((t) => !usedIds.has(t.task.id))
      .sort((a, b) => b.severity - a.severity),
    BUCKET_CAP,
  );

  // ─ Suggested focus: top 3 across attention + risks. due-soon
  // outranks stuck-work outranks overload. Already capped at 3.
  const focusSource = [...attention, ...risks]
    .sort((a, b) => focusWeight(b) - focusWeight(a))
    .slice(0, BUCKET_CAP);

  const needsAttention: BriefItem[] = attention.map((t) =>
    toItem(t, rotationIndex, now),
  );
  const movingWell: BriefItem[] = moving.map((t) =>
    toItem(t, rotationIndex, now),
  );
  const quietRisks: BriefItem[] = risks.map((t) =>
    toItem(t, rotationIndex, now),
  );
  const suggestedFocus: FocusItem[] = focusSource.map((t) =>
    toFocus(t, rotationIndex, now),
  );

  const isEmpty =
    needsAttention.length === 0 &&
    movingWell.length === 0 &&
    quietRisks.length === 0;

  return {
    userId,
    generatedAt: now,
    greetingHour: new Date(now).getUTCHours(),
    needsAttention,
    movingWell,
    quietRisks,
    suggestedFocus,
    isEmpty,
  };
}

function pickTop(list: Triggered[], cap: number): Triggered[] {
  return list.slice(0, cap);
}

function toItem(t: Triggered, rotation: number, now: number): BriefItem {
  const daysOut =
    t.task.dueAt != null ? (t.task.dueAt - now) / DAY : undefined;
  const text = phraseFor(t.trigger, t.task, rotation, {
    idleDays: t.task.idleDays,
    daysOut,
  });
  return {
    id: t.task.id,
    text,
    sourceLabel: t.task.sourceLabel,
    trigger: t.trigger,
    reasons: t.reasons,
  };
}

function toFocus(t: Triggered, rotation: number, now: number): FocusItem {
  return {
    id: t.task.id,
    text: focusText(t, now),
    due: focusDue(t, now),
    trigger: t.trigger,
  };
}

function focusText(t: Triggered, now: number): string {
  // The focus block is more action-oriented than the buckets:
  // "Confirm florist deposit Monday" not "Florist deposit has been held up".
  switch (t.trigger) {
    case "stuck-work":
      return `Move ${t.task.title.toLowerCase()} forward`;
    case "due-soon": {
      const daysOut = t.task.dueAt != null ? (t.task.dueAt - now) / DAY : 0;
      if (daysOut < 0) return `Catch up on ${t.task.title.toLowerCase()}`;
      return `Send/close ${t.task.title.toLowerCase()}`;
    }
    case "overload":
      return `Drop two in-flight items by end of day`;
    case "just-shipped":
      return `Acknowledge ${t.task.title.toLowerCase()}`;
    case "crowded-week":
      return `Plan the week — pull two items earlier`;
    case "blocked-too-long":
      return `Chase the blocker on ${t.task.title.toLowerCase()}`;
  }
}

function focusDue(t: Triggered, now: number): string {
  if (t.trigger === "due-soon" && t.task.dueAt != null) {
    const daysOut = (t.task.dueAt - now) / DAY;
    if (daysOut < 0) return "overdue";
    if (daysOut < 1) return "today";
    if (daysOut < 2) return "tomorrow";
    if (daysOut < 5) return `by ${weekday(t.task.dueAt)}`;
    return "this week";
  }
  if (t.trigger === "overload") return "today";
  if (t.trigger === "crowded-week") return "this week";
  if (t.trigger === "blocked-too-long") return "this week";
  return "this week";
}

function weekday(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IE", { weekday: "long" });
}

/** Focus ranking — locked weights for the six v1 triggers.
 *  due-soon outranks everything (real deadline pressure).
 *  crowded-week sits between due-soon and stuck-work — it's a
 *  cluster signal but not yet a per-task deadline.
 *  blocked-too-long ranks below stuck-work because the action
 *  ("chase the blocker") is upstream, not the user's own work.
 *  just-shipped is celebration-only — never the lead of focus. */
function focusWeight(t: Triggered): number {
  const base: Record<TriggerKind, number> = {
    "due-soon": 1000,
    "crowded-week": 800,
    "stuck-work": 700,
    "blocked-too-long": 600,
    overload: 500,
    "just-shipped": 100,
  };
  return base[t.trigger] + t.severity;
}

/** Stable per-day rotation index so the same user gets a different
 *  phrasing each day, but the same phrasing if they reload the
 *  brief twice on the same day. */
function dayRotation(userId: string, now: number): number {
  const day = Math.floor(now / DAY);
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = ((h << 5) - h + userId.charCodeAt(i)) | 0;
  }
  return Math.abs(h + day);
}
