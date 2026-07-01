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
 * Calm one-line load receipt under the greeting. Numbers appear only
 * with a sentence around them: source count as proof, not a dashboard.
 */
export function loadLine(b: Briefing): string {
  const load = b.needsAttention.length + b.quietRisks.length;
  if (load === 0) return "";

  const label =
    load <= 1 ? "Light day" : load <= 3 ? "Moderate day" : load <= 5 ? "Active day" : "Heavy day";
  const signalWord = load === 1 ? "signal" : "signals";
  const source =
    b.activeSourceCount > 0
      ? ` from ${b.activeSourceCount} active ${b.activeSourceCount === 1 ? "item" : "items"}`
      : "";

  return `${label}. ${load} ${signalWord} surfaced${source}.`;
}

/**
 * Calm one-line verdict under the load receipt. Shape of the day in
 * plain English — no numbers without a "so what".
 *
 * Silence is the signal. On a brief with nothing to flag,
 * `summaryLine` returns the empty string and lets the EmptyState
 * frame the page. The function speaks only when there is something
 * to summarise.
 */
export function summaryLine(b: Briefing): string {
  const att = b.needsAttention.length;
  const risks = b.quietRisks.length;
  if (att === 0 && risks === 0) {
    // Nothing pulling. The summary line says nothing. EmptyState
    // (briefing-view) carries the frame on these days.
    return "";
  }
  if (att === 0 && risks > 0) {
    return risks === 1
      ? "No urgent pulls. One quiet risk is worth watching."
      : `No urgent pulls. ${countWord(risks)} quiet risks are worth watching.`;
  }
  const attention =
    att === 1
      ? "One thing needs attention."
      : `${countWord(att)} things need attention.`;
  if (risks === 0) return attention;
  return `${attention} ${
    risks === 1
      ? "One quiet risk is building."
      : `${countWord(risks)} quiet risks are building.`
  }`;
}

function countWord(n: number): string {
  return n === 1 ? "One" : n === 2 ? "Two" : n === 3 ? "Three" : String(n);
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
