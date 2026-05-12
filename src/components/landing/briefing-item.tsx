"use client";

import { AnimatePresence, motion } from "motion/react";
import { WhyThis } from "./why-this";

type Props = {
  text: string;
  variantKey: number;
  swapping?: boolean;
  provenance?: string;
  itemId?: string;
  /** When set, the row registers its DOM element under its id. */
  onRegister?: (id: string, el: HTMLDivElement | null) => void;
  /** When true, cursor is reading this item — outline highlight. */
  highlight?: boolean;
  /** When true, render the "Why this?" expansion underneath. */
  whyThisVisible?: boolean;
  /** Reason chain for the why-this expansion. */
  whyThisReasons?: string[];
  /** Character reveal for the typing line in why-this. */
  whyThisReveal?: number;
  /** When true, render strike-through fade (acknowledge). */
  acknowledging?: boolean;
  /** When true, this item is in the focus block and acknowledge is in play. */
  showAcknowledgeAffordance?: boolean;
};

export function BriefingItem({
  text,
  variantKey,
  swapping,
  provenance,
  itemId,
  onRegister,
  highlight,
  whyThisVisible,
  whyThisReasons,
  whyThisReveal,
  acknowledging,
  showAcknowledgeAffordance,
}: Props) {
  return (
    <div
      ref={(el) => {
        if (itemId) onRegister?.(itemId, el);
      }}
      data-item-id={itemId}
      style={{
        borderRadius: 6,
        padding: highlight ? "4px 6px" : 0,
        margin: highlight ? "-4px -6px" : 0,
        background: highlight
          ? "color-mix(in srgb, var(--brand) 6%, transparent)"
          : "transparent",
        transition: "background 220ms cubic-bezier(.16,1,.3,1)",
      }}
    >
      <motion.div
        animate={{
          opacity: acknowledging ? 0.36 : 1,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-baseline gap-2"
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
                textDecoration: acknowledging ? "line-through" : undefined,
                textDecorationColor: "var(--ink-quiet)",
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
        {showAcknowledgeAffordance ? (
          <AnimatePresence>
            {!acknowledging ? (
              <motion.span
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="font-mono"
                style={{
                  fontSize: 10.5,
                  color: "var(--ink-quiet)",
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  border: "1px solid var(--border-soft)",
                  borderRadius: 999,
                  padding: "2px 7px",
                  background: "var(--bg-elev)",
                  flexShrink: 0,
                  cursor: "default",
                }}
              >
                Mark done
              </motion.span>
            ) : null}
          </AnimatePresence>
        ) : null}
      </motion.div>
      {whyThisReasons ? (
        <WhyThis
          visible={!!whyThisVisible}
          reasons={whyThisReasons}
          revealChars={whyThisReveal}
        />
      ) : null}
    </div>
  );
}
