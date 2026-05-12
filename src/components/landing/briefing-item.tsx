"use client";

import { AnimatePresence, motion } from "motion/react";

type Props = {
  /** Text to render. */
  text: string;
  /** Variant key — changing this triggers a swap animation. */
  variantKey: number;
  /** When true, this item is the one whose phrasing is currently swapping. */
  swapping?: boolean;
  /** Provenance line (e.g. "from Tasks · Wedding 2026"). */
  provenance?: string;
};

/**
 * A single line in the briefing. Phrasing variant is keyed so AnimatePresence
 * can tick-swap the string when the engine selects a different variant.
 * Provenance trail sits under each item — proves the read model.
 */
export function BriefingItem({ text, variantKey, swapping, provenance }: Props) {
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
          marginTop: 8,
        }}
      />
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.p
            key={variantKey}
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
        {provenance ? (
          <p
            className="font-mono"
            style={{
              fontSize: 10,
              color: "var(--ink-faint)",
              letterSpacing: "0.02em",
              marginTop: 2,
              marginBottom: 0,
              textTransform: "lowercase",
            }}
          >
            {provenance}
          </p>
        ) : null}
      </div>
    </div>
  );
}
