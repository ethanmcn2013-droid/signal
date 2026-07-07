"use client";

import { AnimatePresence, motion } from "motion/react";

export type ToastVariant = "delivered";

type Props = {
  variant: ToastVariant | null;
};

const COPY: Record<ToastVariant, { icon: React.ReactNode; text: string }> = {
  delivered: {
    icon: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 4h16v16H4z" />
        <path d="M4 4l8 9 8-9" />
      </svg>
    ),
    text: "Delivered to inbox",
  },
};

export function DemoToast({ variant }: Props) {
  const active = variant ? COPY[variant] : null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute right-3 bottom-3 z-40 sm:right-5 sm:bottom-5"
    >
      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key={variant}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            // --motion-moderate 320ms + --ease-out
            transition={{ duration: 0.32, ease: [0, 0, 0.2, 1] }}
            className="flex items-center gap-2 px-2.5 py-1 font-mono text-[9.5px] font-semibold uppercase"
            style={{
              /* Solid-ink tag, the hero's DUE TODAY chip grammar. */
              background: "var(--ink)",
              color: "var(--paper)",
              borderRadius: 2,
              letterSpacing: "0.14em",
            }}
          >
            <span style={{ color: "var(--paper)" }}>{active.icon}</span>
            {active.text}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
