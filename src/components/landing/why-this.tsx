"use client";

import { AnimatePresence, motion } from "motion/react";

type Props = {
  visible: boolean;
  /** Reason chain, each line appears with a slight stagger. */
  reasons: string[];
  /** Character count revealed of the final reason line, drives type-on. */
  revealChars?: number;
  /**
   * The trigger name + threshold (e.g. `inactive-project · ≥ 8 days`).
   * Shown as a mono caption above the eyebrow. Makes the determinism
   * experienceable, there is a rule, it has a name, it has a threshold.
   */
  triggerName?: string;
};

/**
 * "Why this?" rule chain expansion that opens beneath an inspected item.
 * Reveals the engine's reasoning in plain English, no chart, no metric,
 * just the rules that fired.
 */
export function WhyThis({ visible, reasons, revealChars, triggerName }: Props) {
  return (
    <AnimatePresence initial={false}>
      {/* --motion-moderate 320ms + --ease-out, accordion */}
      {visible ? (
        <motion.div
          key="why-this"
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 6 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{
            opacity:   { duration: 0.22, ease: [0, 0, 0.2, 1] },
            height:    { duration: 0.32, ease: [0, 0, 0.2, 1] },
            marginTop: { duration: 0.32, ease: [0, 0, 0.2, 1] },
          }}
          style={{ overflow: "hidden" }}
        >
          <div
            style={{
              /* Footnote under a hairline, not a grey app card. */
              borderTop: "1px solid var(--hairline-soft)",
              padding: "8px 0 2px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              className="font-mono"
              style={{
                fontSize: 9.5,
                fontWeight: 600,
                color: "var(--brand)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: triggerName ? 2 : 4,
              }}
            >
              Why this
            </div>
            {triggerName ? (
              <div
                className="font-mono"
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: "var(--ink-faint)",
                  letterSpacing: "0.02em",
                  marginBottom: 6,
                  textTransform: "lowercase",
                }}
              >
                trigger · {triggerName}
              </div>
            ) : null}
            {reasons.map((reason, i) => {
              const isLast = i === reasons.length - 1;
              const text =
                isLast && typeof revealChars === "number"
                  ? reason.slice(0, revealChars)
                  : reason;
              return (
                /* stagger: i × 0.05s ≤ --motion-fast between items */
              <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -3 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.22,
                    ease: [0, 0, 0.2, 1],
                    delay: i * 0.05,
                  }}
                  style={{
                    fontSize: 12.5,
                    color: "var(--ink-soft)",
                    lineHeight: 1.45,
                    margin: 0,
                  }}
                >
                  → {text}
                  {isLast &&
                  typeof revealChars === "number" &&
                  revealChars < reason.length ? (
                    <motion.span
                      aria-hidden
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{
                        display: "inline-block",
                        width: 1.5,
                        height: 11,
                        background: "var(--brand)",
                        verticalAlign: "text-bottom",
                        marginLeft: 1,
                        transform: "translateY(1px)",
                      }}
                    />
                  ) : null}
                </motion.p>
              );
            })}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
