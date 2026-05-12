"use client";

import { AnimatePresence, motion } from "motion/react";
import type { BriefingItem } from "./types";

type Props = {
  item: BriefingItem;
  /** When true, this item is the one whose phrasing is currently swapping. */
  swapping?: boolean;
};

/**
 * A single line in the briefing. Phrasing variant is keyed so AnimatePresence
 * can tick-swap the string when the engine selects a different variant.
 *
 * The tick gesture is intentionally sharp — short duration, step-like easing.
 * Matches Analytics's temporality (discrete reads, not continuous flow).
 */
export function BriefingItem({ item, swapping }: Props) {
  const text = item.variants[item.variantIndex] ?? item.variants[0];

  return (
    <div className="flex items-baseline gap-2">
      <span
        aria-hidden
        style={{
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: "var(--ink-faint)",
          flexShrink: 0,
          transform: "translateY(-3px)",
        }}
      />
      <AnimatePresence mode="wait">
        <motion.p
          key={item.variantIndex}
          initial={swapping ? { opacity: 0, y: -2 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 2 }}
          transition={{ duration: 0.18, ease: [0.6, 0, 0.4, 1] }}
          style={{
            fontSize: 14.5,
            color: "var(--ink-soft)",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {text}
          {swapping ? (
            <motion.span
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.42, times: [0, 0.4, 1] }}
              style={{
                display: "inline-block",
                marginLeft: 6,
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "var(--brand)",
                transform: "translateY(-1px)",
                verticalAlign: "middle",
              }}
            />
          ) : null}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
