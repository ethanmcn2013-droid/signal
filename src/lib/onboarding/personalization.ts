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

const BY_SEGMENT: Record<PrimaryUseCase, BriefingEmptyCopy> = {
  venue: {
    headline: "Quiet day at the venue.",
    body: "No flags from Tasks right now. When a booking or couple needs attention, it surfaces here first.",
  },
  wedding: {
    headline: "Nothing to flag today.",
    body: "The plan is on track. Your next briefing builds tomorrow at 6am.",
  },
  student: {
    headline: "Clear runway this morning.",
    body: "No committee fires to flag. Add tasks in Signal Tasks and they'll land in tomorrow's brief.",
  },
  "small-business": {
    headline: "Nothing urgent on the board.",
    body: "Quiet days are good. When follow-ups or deadlines slip, you'll see them here — not in a spreadsheet.",
  },
  "event-management": {
    headline: "No flags across your events.",
    body: "The pipeline is calm. Milestones and due dates from Tasks will show up when they need a nudge.",
  },
  "creative-studio": {
    headline: "Studio is quiet today.",
    body: "No deliverables flagged. When a deadline approaches, the brief catches it before the client does.",
  },
  "internal-team": {
    headline: "Team board is clear.",
    body: "Nothing needs attention this morning. Blocked work and due dates from Tasks appear here automatically.",
  },
  other: {
    headline: "Nothing to flag today.",
    body: "No briefing email is sent on quiet days. The board is clear.",
  },
};

const DEFAULT_EMPTY: BriefingEmptyCopy = {
  headline: "Nothing to flag today.",
  body: "No briefing email is sent on quiet days. The board is clear.",
};

export function getBriefingEmptyCopy(input: {
  primaryUseCase: string | null | undefined;
}): BriefingEmptyCopy {
  if (input.primaryUseCase && isPrimaryUseCase(input.primaryUseCase)) {
    return BY_SEGMENT[input.primaryUseCase];
  }
  return DEFAULT_EMPTY;
}
