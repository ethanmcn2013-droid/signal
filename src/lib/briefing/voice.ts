import type { Briefing } from "./types";

/**
 * Single source of truth for the briefing's voice helpers. Used by:
 *   - `src/lib/email/briefing-email.tsx` (HTML email)
 *   - `src/lib/email/plain-text.ts`      (text/plain email body)
 *   - `src/components/brief/briefing-view.tsx` (web /app render)
 *
 * Previously these three callers each carried verbatim copies of
 * greeting/summaryLine/graceNote — voice changes drifted between them.
 */

/**
 * `forEmail` — when true, always returns "Good morning." regardless of
 * hour. The cron fires at 06:00 UTC; non-EU users would receive
 * "Good evening" in their morning email until per-TZ cron exists.
 * Time-of-day variants are reserved for the web view where the browser
 * supplies the correct local time.
 */
export function greeting(
  hour: number,
  firstName?: string | null,
  forEmail?: boolean,
): string {
  const base = forEmail
    ? "Good morning"
    : hour < 5
      ? "It's late"
      : hour < 12
        ? "Good morning"
        : hour < 17
          ? "Good afternoon"
          : "Good evening";
  return firstName ? `${base}, ${firstName}.` : `${base}.`;
}

/**
 * Calm one-line summary under the greeting. Shape of the day in
 * plain English — no numbers without a "so what".
 */
export function summaryLine(b: Briefing): string {
  const att = b.needsAttention.length;
  const risks = b.quietRisks.length;
  const moving = b.movingWell.length;
  if (att === 0 && risks === 0) {
    if (moving > 0) return "Light morning. The board is moving.";
    return "Quiet morning. Nothing pulling.";
  }
  if (att === 0 && risks > 0) {
    return `A quiet morning, but ${risks} ${risks === 1 ? "risk" : "risks"} worth watching.`;
  }
  if (att === 1) return "One thing's calling.";
  if (att === 2) return "Two things calling — and a few quieter signals below.";
  return `Three things calling${risks > 0 ? ", more quietly behind them" : ""}.`;
}

/**
 * Soft sign-off. Adjusts to the shape of the brief without ever
 * becoming chatty. Read aloud — if it sounds like a friend, keep it.
 */
export function graceNote(b: Briefing): string {
  if (b.isEmpty) return "That's the read.";
  if (b.suggestedFocus.length === 0) return "That's the read — good day.";
  if (b.needsAttention.length >= 2) return "Take the focus block first. The rest can wait.";
  return "That's the read. Open Tasks when you're ready.";
}
