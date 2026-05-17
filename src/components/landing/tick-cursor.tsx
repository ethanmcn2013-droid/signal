"use client";

import { motion } from "motion/react";

type Props = {
  /** Show a "Delivered" tick label adjacent to the timestamp. */
  delivered: boolean;
};

/**
 * The mono timestamp + tick gesture. Steps once per beat — discrete reads,
 * never continuous flow. Reads as the briefing's own clock.
 */
export function TickCursor({ delivered }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="font-mono text-[11px] font-semibold uppercase"
        style={{
          color: "var(--ink-quiet)",
          letterSpacing: "0.14em",
        }}
      >
        Wednesday · 06:00
      </span>

      {/* Step-tick indicator */}
      <motion.span
        aria-hidden
        animate={{
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 3.6,
          times: [0, 0.04, 0.5],
          ease: "linear",
          repeat: Infinity,
        }}
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "var(--brand)",
        }}
      />

      {/* --motion-moderate 320ms + --ease-out */}
      {delivered ? (
        <motion.span
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 4 }}
          transition={{ duration: 0.32, ease: [0, 0, 0.2, 1] }}
          className="font-mono text-[11px] font-semibold uppercase"
          style={{
            color: "var(--brand)",
            letterSpacing: "0.14em",
            marginLeft: 2,
          }}
        >
          · Delivered
        </motion.span>
      ) : null}
    </div>
  );
}
