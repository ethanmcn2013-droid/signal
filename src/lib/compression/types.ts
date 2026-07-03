/**
 * compression/types.ts, Briefing assembly types + locked caps.
 *
 * Per analytics/docs/PRODUCT.md §4 + §5.3:
 *  - 4 blocks. Always 4. Always in fixed order.
 *  - Hard cap of 3 items per block.
 *  - "Items below the cap are suppressed silently. They are NOT
 *     moved to a 'more' section. They do not appear."
 *  - "A list of every open task is not a briefing."
 *
 * The discipline IS the product.
 *
 * Plan 6 · Cycle 6.1 (Architecture + data layer).
 */

import type { BriefingBlockId } from "../triggers/types";

/** Hard cap per block. PRODUCT.md §5.3 says max 3, non-negotiable. */
export const BLOCK_CAP = 3;

/** A single rendered briefing item, already prose. */
export interface BriefingItem {
  /** The trigger that produced this, kept for "why am I seeing this?". */
  triggerId: import("../triggers/types").TriggerId;
  /** What this is about. */
  entityType: "task" | "project" | "user";
  entityId: string;
  /** The rendered sentence. */
  text: string;
}

/** A block of the briefing. */
export interface BriefingBlock {
  id: BriefingBlockId;
  /** User-facing label, e.g. "Needs attention". */
  label: string;
  /** Color dot per PRODUCT.md §4. */
  dot: string;
  /** Capped at BLOCK_CAP. */
  items: BriefingItem[];
}

/** The 4 blocks in their fixed order. PRODUCT.md §4, order is locked. */
export const BLOCK_ORDER: BriefingBlockId[] = [
  "needs-attention",
  "moving-well",
  "quiet-risks",
  "suggested-focus",
];

/** Block metadata, labels and dot colors (PRODUCT.md §4 table). */
export const BLOCK_META: Record<BriefingBlockId, { label: string; dot: string }> = {
  "needs-attention": { label: "Needs attention", dot: "#f59e0b" },
  "moving-well":     { label: "Moving well",     dot: "#10b981" },
  "quiet-risks":     { label: "Quiet risks",     dot: "#71717a" },
  "suggested-focus": { label: "Suggested focus", dot: "#4f46e5" },
};
