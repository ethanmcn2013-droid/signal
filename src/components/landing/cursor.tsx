"use client";

import { motion } from "motion/react";

type Props = {
  x: number;
  y: number;
  visible: boolean;
  /** Cursor's accent color. */
  color: string;
  /** Short chip rendered next to the cursor when reading. */
  label?: string;
  reading?: boolean;
};

/**
 * A single anonymous reader cursor over the briefing surface. Analytics
 * is a personal surface (one reader at a time), so only one cursor —
 * Roadmap's pattern but solo. The label carries no name (you don't
 * watch yourself), just a quiet "reading" pill when paused.
 */
export function Cursor({ x, y, visible, color, label, reading }: Props) {
  return (
    <motion.div
      aria-hidden
      animate={{
        x,
        y,
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.6,
      }}
      transition={{
        /* Demo choreography — cursor drift timing is intentional */
        x: { duration: 1.1, ease: [0.2, 0, 0, 1] },
        y: { duration: 1.1, ease: [0.2, 0, 0, 1] },
        /* --motion-moderate 320ms + --ease-out for appear/disappear */
        opacity: { duration: 0.32, ease: [0, 0, 0.2, 1] },
        scale: { duration: 0.32, ease: [0, 0, 0.2, 1] },
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 30,
        willChange: "transform",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          filter: "drop-shadow(0 2px 5px rgba(20,21,26,0.18))",
          transform: "translate(-2px, -2px)",
        }}
      >
        <path
          d="M5 3.2L19 10.6L11.6 12.6L9.4 20L5 3.2Z"
          fill={color}
          stroke="white"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>

      <motion.div
        initial={false}
        animate={{
          opacity: reading && label ? 1 : 0,
          y: reading && label ? 0 : -3,
        }}
        // --motion-base 220ms + --ease-out
        transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
        className="font-mono"
        style={{
          position: "absolute",
          top: 18,
          left: 14,
          padding: "2px 6px",
          borderRadius: 999,
          background: color,
          color: "white",
          fontSize: 9.5,
          fontWeight: 600,
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 6px rgba(20,21,26,0.18)",
        }}
      >
        {label ?? ""}
      </motion.div>
    </motion.div>
  );
}
