/**
 * compression/compress.ts — Rank + cap + drop.
 *
 * Cycle 6.1 shipped the per-block compression skeleton.
 * Cycle 6.4 wired the Suggested Focus block.
 * Cycle 6.5a.1: render contract gained a `blockId` argument so the
 * orchestrator can pick variant-aware prose (action register for
 * Suggested Focus, self register for reader-as-subject insights).
 *
 * Ranking weights and caps locked per analytics/docs/PRODUCT.md §5.3.
 */

import type { Insight, BriefingBlockId } from "../triggers/types";
import { BLOCK_CAP, BLOCK_META, BLOCK_ORDER } from "./types";
import type { BriefingBlock, BriefingItem } from "./types";

/** Combined rank score — higher means more important. */
export function rankScore(insight: Insight): number {
  const { cascade, irreversibility, proximity } = insight.rank;
  return cascade * 0.4 + irreversibility * 0.35 + proximity * 0.25;
}

export function compress(
  insights: Insight[],
  render: (insight: Insight, blockId: BriefingBlockId) => BriefingItem,
): BriefingBlock[] {
  const ranked = insights
    .map((insight) => ({ insight, score: rankScore(insight) }))
    .sort((a, b) => b.score - a.score);

  return BLOCK_ORDER.map((blockId) => {
    const meta = BLOCK_META[blockId];

    if (blockId === "suggested-focus") {
      const items = ranked
        .slice(0, BLOCK_CAP)
        .map(({ insight }) => render(insight, blockId));
      return {
        id: blockId,
        label: meta.label,
        dot: meta.dot,
        items,
      };
    }

    const candidates = ranked
      .filter(({ insight }) => insight.defaultBlock === blockId)
      .slice(0, BLOCK_CAP)
      .map(({ insight }) => render(insight, blockId));

    return {
      id: blockId,
      label: meta.label,
      dot: meta.dot,
      items: candidates,
    };
  });
}
