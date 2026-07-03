"use client";

import { AnimatePresence, motion } from "motion/react";

type Props = {
  /** Items that tried to enter but failed the cap. */
  overflow: { id: string; text: string }[];
  /** "attempt", visible, dimmed, slated for drop. "drop", fading out. */
  phase: "hidden" | "attempt" | "drop";
};

/**
 * Renders the silent-drop moment, extra items briefly appear under a block,
 * then fade out without UI fanfare. The discipline IS the demo.
 */
export function CapOverflow({ overflow, phase }: Props) {
  const showing = phase === "attempt";

  return (
    <AnimatePresence mode="popLayout">
      {showing && overflow.length > 0 ? (
        <motion.div
          key="overflow"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{
            opacity: { duration: 0.22, ease: [0, 0, 0.2, 1] },
            height: { duration: 0.32, ease: [0, 0, 0.2, 1] },
          }}
          style={{ overflow: "hidden" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              paddingTop: 8,
              paddingLeft: 14,
            }}
          >
            {overflow.map((o, i) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{
                  opacity: [0, 0.62, 0.62, 0],
                  x: 0,
                }}
                // Demo choreography, 1.8s is intentional cap-drop timing
                transition={{
                  duration: 1.8,
                  times: [0, 0.18, 0.7, 1],
                  ease: [0.2, 0, 0, 1],
                  delay: i * 0.14,
                }}
                className="flex items-baseline gap-2"
                style={{ fontStyle: "normal" }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    background: "var(--ink-faint)",
                    flexShrink: 0,
                    transform: "translateY(-3px)",
                    opacity: 0.45,
                  }}
                />
                <p
                  style={{
                    fontSize: 13.5,
                    color: "var(--ink-quiet)",
                    lineHeight: 1.45,
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  {o.text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
