"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";
import type { BriefItem, Briefing, FocusItem } from "@/lib/briefing/types";
import { graceNote, greeting, summaryLine } from "@/lib/briefing/voice";

// ─────────────────────────────────────────────────────────────
// Motion grammar — calm, purposeful. The brief is supposed to feel
// like a page settling into view, not a slideshow.
//
//   outExpo:    confident arrivals, "settled" feel. Default.
//   inOut:      crossfades that aren't entering or leaving.
//   spring:     hover affordance only (tactile).
//
// Reduced motion: MotionConfig reducedMotion="user" collapses
// every animation to zero — accessibility prefs win in one line.
// ─────────────────────────────────────────────────────────────
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

const bucketAccents = {
  attention: "var(--brand, #4f46e5)",
  moving: "rgb(46, 160, 110)",
  risks: "var(--brand, #4f46e5)",
  focus: "var(--brand, #4f46e5)",
} as const;

/**
 * The in-app render of the briefing. Mirrors the email's hierarchy
 * but earns its extra cost on the web — motion-led reveals, the
 * reader-cursor hover affordance, and the motion accordion for
 * "why this →" expansions (the one thing email by design omits).
 */
export function BriefingView({
  briefing,
  firstName,
}: {
  briefing: Briefing;
  firstName?: string | null;
}) {
  const stamp = new Date(briefing.generatedAt).toLocaleString("en-IE", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <MotionConfig reducedMotion="user">
      <motion.article
        className="mx-auto w-full max-w-[640px] px-6 py-12"
        initial="hidden"
        animate="shown"
        variants={{
          shown: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
        }}
      >
        <Header stamp={stamp} />

        <motion.h1
          className="mb-3 text-[32px] font-semibold leading-[1.15] tracking-[-0.015em]"
          style={{ color: "var(--ink)" }}
          variants={fadeUp}
        >
          {greeting(briefing.greetingHour, firstName)}
        </motion.h1>

        <motion.p
          className="mb-10 text-[15.5px] leading-[1.55]"
          style={{ color: "var(--ink-soft)" }}
          variants={fadeUp}
        >
          {summaryLine(briefing)}
        </motion.p>

        {briefing.isEmpty ? (
          <EmptyState />
        ) : (
          <>
            <Bucket
              title="Needs attention"
              items={briefing.needsAttention}
              accent={bucketAccents.attention}
            />
            <Bucket
              title="Moving well"
              items={briefing.movingWell}
              accent={bucketAccents.moving}
              muted
            />
            <Bucket
              title="Quiet risks"
              items={briefing.quietRisks}
              accent={bucketAccents.risks}
            />
            <FocusBlock items={briefing.suggestedFocus} />
          </>
        )}

        <motion.p
          className="mt-12 text-[11px] uppercase tracking-[0.14em]"
          style={{ color: "var(--ink-quiet)" }}
          variants={fadeUp}
        >
          {graceNote(briefing)}
        </motion.p>
      </motion.article>
    </MotionConfig>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
};

function Header({ stamp }: { stamp: string }) {
  return (
    <motion.div
      className="mb-6 flex items-center justify-between"
      variants={fadeUp}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: "var(--ink-quiet)" }}
      >
        Daily Signal · {stamp}
      </p>
      <div
        className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em]"
        style={{ color: "var(--ink-quiet)" }}
      >
        <motion.span
          aria-hidden
          className="block h-1.5 w-1.5 rounded-full"
          style={{ background: "rgb(46, 160, 110)" }}
          animate={{ opacity: [0.55, 1, 0.55], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        Live
      </div>
    </motion.div>
  );
}

/**
 * One bucket. Items use a "reader cursor" hover affordance —
 * hovering any item lights it up and dims the others in the same
 * bucket. Lifted from the marketing demo's cursor pattern.
 */
function Bucket({
  title,
  items,
  accent,
  muted,
}: {
  title: string;
  items: BriefItem[];
  accent: string;
  muted?: boolean;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  if (items.length === 0) return null;

  return (
    <motion.section
      className="mb-9"
      variants={{
        shown: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
      }}
    >
      <motion.div
        className="mb-4 flex items-center gap-2.5"
        variants={fadeUp}
      >
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: accent }}
        />
        <h2
          className="text-[13px] font-semibold uppercase tracking-[0.06em]"
          style={{ color: muted ? "var(--ink-soft)" : "var(--ink)" }}
        >
          {title}
        </h2>
      </motion.div>

      <ul
        className="space-y-5"
        onMouseLeave={() => setActiveId(null)}
      >
        {items.map((item) => (
          <BriefRow
            key={item.id}
            item={item}
            accent={accent}
            muted={muted}
            activeId={activeId}
            setActiveId={setActiveId}
          />
        ))}
      </ul>
    </motion.section>
  );
}

function BriefRow({
  item,
  accent,
  muted,
  activeId,
  setActiveId,
}: {
  item: BriefItem;
  accent: string;
  muted?: boolean;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const isActive = activeId === item.id;
  const isDim = activeId !== null && !isActive;

  return (
    <motion.li
      variants={fadeUp}
      onMouseEnter={() => setActiveId(item.id)}
      onFocus={() => setActiveId(item.id)}
      animate={{
        opacity: isDim ? 0.45 : 1,
      }}
      transition={{ duration: 0.22, ease: EASE_IN_OUT }}
      className="relative pl-3"
      style={{
        borderLeft: `2px solid ${isActive ? accent : "transparent"}`,
        transition: "border-color 220ms ease",
      }}
    >
      <p
        className="text-[16px] leading-[1.5]"
        style={{ color: "var(--ink)" }}
      >
        {item.text}
      </p>
      <p
        className="mt-1 text-[12px]"
        style={{ color: "var(--ink-quiet)" }}
      >
        from {item.sourceLabel}
      </p>
      {item.reasons.length > 0 && !muted && (
        <WhyThisAccordion
          open={open}
          setOpen={setOpen}
          reasons={item.reasons}
        />
      )}
    </motion.li>
  );
}

/**
 * Why-this gesture — replaces the browser-default <details> with
 * a motion accordion that cascades reasons in with a stagger.
 * This is the one expansion email by design omits, so the web view
 * owes it real polish.
 */
function WhyThisAccordion({
  open,
  setOpen,
  reasons,
}: {
  open: boolean;
  setOpen: (next: boolean) => void;
  reasons: string[];
}) {
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-[12px] outline-none transition-colors"
        style={{
          color: open ? "var(--ink)" : "var(--ink-soft)",
        }}
        aria-expanded={open}
      >
        <motion.span
          className="inline-block"
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
        >
          →
        </motion.span>{" "}
        Why this
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
            className="overflow-hidden"
          >
            <motion.div
              className="mt-2 space-y-1.5 pl-3 text-[12.5px]"
              style={{ color: "var(--ink-soft)" }}
              initial="hidden"
              animate="shown"
              exit="hidden"
              variants={{
                shown: { transition: { staggerChildren: 0.06 } },
                hidden: {},
              }}
            >
              {reasons.map((r, i) => (
                <motion.li
                  key={i}
                  className="list-none"
                  variants={{
                    hidden: { opacity: 0, x: -4 },
                    shown: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.3, ease: EASE_OUT_EXPO },
                    },
                  }}
                >
                  → {r}
                </motion.li>
              ))}
            </motion.div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function FocusBlock({ items }: { items: FocusItem[] }) {
  if (items.length === 0) return null;
  return (
    <motion.section
      className="relative mt-10 rounded-2xl border p-6"
      variants={fadeUp}
      style={{
        borderColor: "color-mix(in srgb, var(--brand) 22%, transparent)",
        background: "color-mix(in srgb, var(--brand) 4%, transparent)",
      }}
    >
      {/* Ambient pulse mark — a subtle "live" sentinel */}
      <motion.span
        aria-hidden
        className="absolute -top-1 -right-1 block h-2 w-2 rounded-full"
        style={{ background: "var(--brand, #4f46e5)" }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [0.85, 1.05, 0.85] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="mb-4 flex items-center gap-2.5">
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--brand, #4f46e5)" }}
        />
        <h2
          className="text-[13px] font-semibold uppercase tracking-[0.06em]"
          style={{ color: "var(--ink)" }}
        >
          Suggested focus
        </h2>
      </div>

      <motion.ul
        className="space-y-3"
        initial="hidden"
        animate="shown"
        variants={{
          shown: { transition: { staggerChildren: 0.07 } },
        }}
      >
        {items.map((item) => (
          <motion.li
            key={item.id}
            variants={fadeUp}
            className="flex items-baseline justify-between gap-4"
          >
            <span
              className="text-[15.5px] leading-[1.45]"
              style={{ color: "var(--ink)" }}
            >
              {item.text}
            </span>
            <span
              className="shrink-0 text-[11px] uppercase tracking-[0.12em]"
              style={{ color: "var(--ink-quiet)" }}
            >
              {item.due}
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </motion.section>
  );
}

function EmptyState() {
  return (
    <motion.div
      className="rounded-2xl border p-10 text-center"
      variants={fadeUp}
      style={{
        borderColor: "var(--line-soft, rgba(20,21,26,0.08))",
        background: "var(--bg-sunken, rgba(20,21,26,0.02))",
      }}
    >
      <p
        className="text-[18px] font-medium"
        style={{ color: "var(--ink)" }}
      >
        Nothing to flag today.
      </p>
      <p
        className="mt-2 text-[14px]"
        style={{ color: "var(--ink-soft)" }}
      >
        No briefing email is sent on quiet days. The board is clear.
      </p>
    </motion.div>
  );
}

// greeting / summaryLine / graceNote moved to @/lib/briefing/voice
// (single source of truth across email/text/web).
