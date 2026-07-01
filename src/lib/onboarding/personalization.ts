/**
 * Briefing empty-state copy keyed by Tasks `primary_use_case`.
 * Sister to tasks/src/lib/onboarding/segments.ts — analytics voice only.
 */

export type PrimaryUseCase =
  | "venue"
  | "wedding"
  | "student"
  | "small-business"
  | "event-management"
  | "creative-studio"
  | "internal-team"
  | "other";

const SEGMENT_IDS = new Set<string>([
  "venue",
  "wedding",
  "student",
  "small-business",
  "event-management",
  "creative-studio",
  "internal-team",
  "other",
]);

export function isPrimaryUseCase(v: string): v is PrimaryUseCase {
  return SEGMENT_IDS.has(v);
}

type BriefingEmptyCopy = { headline: string; body: string };

// The all-clear is a designed destination (briefing-view AllClear),
// so every line here is a headline in display type. Rules: plain
// English, no "board" (banned vocabulary), no repeating the "next
// briefing builds tomorrow" mechanics — the footnote under the
// headline already carries that, once.
const BY_SEGMENT: Record<PrimaryUseCase, BriefingEmptyCopy> = {
  venue: {
    headline: "Quiet day at the venue.",
    body: "No flags from Tasks right now. When a booking or a couple needs attention, it surfaces here first.",
  },
  wedding: {
    headline: "Nothing needs you today.",
    body: "The plan is on track. Enjoy the quiet.",
  },
  student: {
    headline: "Clear runway this morning.",
    body: "Nothing due, nothing slipping. Add tasks in Signal Tasks and they land in tomorrow's brief.",
  },
  "small-business": {
    headline: "Nothing urgent today.",
    body: "Quiet days are good. When a follow-up or a deadline slips, you see it here — not in a spreadsheet.",
  },
  "event-management": {
    headline: "No flags across your events.",
    body: "The pipeline is calm. Milestones and due dates from Tasks show up when they need a nudge.",
  },
  "creative-studio": {
    headline: "The studio is quiet today.",
    body: "No deliverables flagged. When a deadline approaches, the brief catches it before the client does.",
  },
  "internal-team": {
    headline: "All clear this morning.",
    body: "Nothing needs attention. Blocked work and due dates from Tasks appear here on their own.",
  },
  other: {
    headline: "Nothing needs you today.",
    body: "No briefing email is sent on quiet days. When something needs you, it lands here first.",
  },
};

const DEFAULT_EMPTY: BriefingEmptyCopy = {
  headline: "Nothing needs you today.",
  body: "No briefing email is sent on quiet days. When something needs you, it lands here first.",
};

export function getBriefingEmptyCopy(input: {
  primaryUseCase: string | null | undefined;
}): BriefingEmptyCopy {
  if (input.primaryUseCase && isPrimaryUseCase(input.primaryUseCase)) {
    return BY_SEGMENT[input.primaryUseCase];
  }
  return DEFAULT_EMPTY;
}
