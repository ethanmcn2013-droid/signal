"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";
import type { BriefItem, Briefing } from "@/lib/briefing/types";
import { graceNote, greeting, summaryLine } from "@/lib/briefing/voice";

// ─────────────────────────────────────────────────────────────
// Motion grammar — Signal Studio Motion Contract v1.
//
// These are JS-side mirrors of the CSS contract tokens. Motion/react
// does not read CSS custom properties at runtime, so we keep named
// constants here that exactly match the :root values in globals.css.
//
//   EASE_OUT    → --ease-out   cubic-bezier(0,0,0.2,1)  arrivals
//   EASE_IN_OUT → --ease-standard cubic-bezier(0.2,0,0,1) crossfades
//
// Duration budget (UI ≤ --motion-moderate = 320ms):
//   fadeUp: --motion-base   220ms  page-settle entrance
//   dim:    --motion-base   220ms  hover cross-fade
//   arrow:  --motion-fast   140ms  micro-affordance rotation
//   expand: --motion-moderate 320ms accordion open/close
//
// Reduced motion: MotionConfig reducedMotion="user" collapses
// every animation to zero — accessibility prefs win in one line.
// ─────────────────────────────────────────────────────────────
// --ease-out: cubic-bezier(0, 0, 0.2, 1)  — confident arrivals
const EASE_OUT = [0, 0, 0.2, 1] as const;
// --ease-standard: cubic-bezier(0.2, 0, 0, 1) — crossfades / dim
const EASE_STANDARD = [0.2, 0, 0, 1] as const;

const bucketAccents = {
  attention: "var(--brand, #4f46e5)",
  risks: "var(--brand, #4f46e5)",
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
      {/* Page-settle entrance: gentle stagger, not a feed pop.
          staggerChildren 0.06s × ~5 children ≤ --motion-moderate. */}
      <motion.article
        className="mx-auto w-full max-w-[640px] px-6 py-12"
        initial="hidden"
        animate="shown"
        variants={{
          shown: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
        }}
      >
        <Header stamp={stamp} />

        <motion.h1
          className="mb-3 text-[32px] font-semibold leading-[1.15] tracking-[-0.035em]"
          style={{ color: "var(--ink)" }}
          variants={fadeUp}
        >
          {greeting(briefing.greetingHour, firstName)}
        </motion.h1>

        {summaryLine(briefing) ? (
          <motion.p
            className="mb-10 text-[15.5px] leading-[1.55]"
            style={{ color: "var(--ink-soft)" }}
            variants={fadeUp}
          >
            {summaryLine(briefing)}
          </motion.p>
        ) : null}

        {briefing.isEmpty ? (
          <EmptyState
            headline={briefing.emptyStateHeadline}
            body={briefing.emptyStateBody}
          />
        ) : (
          <>
            <Bucket
              title="Needs attention"
              items={briefing.needsAttention}
              accent={bucketAccents.attention}
            />
            {/* "Moving well" is cut from the default morning brief.
                The just-shipped trigger weight is the lowest of six
                (100/1000); the engine had already decided this is
                not the signal. The bucket data still lives on the
                Briefing object — a future "what shipped" surface
                may consume it — but the morning read does not. */}
            <Bucket
              title="Quiet risks"
              items={briefing.quietRisks}
              accent={bucketAccents.risks}
            />
            {/* "Suggested focus" is cut. The block was a sorted
                re-projection of attention + risks already on the
                page — the same items, second time on screen, under
                a different header. The Needs-attention items are
                already the focus. The suggestedFocus array stays on
                the Briefing object for the email render and future
                surfaces; the web brief does not double up. */}
          </>
        )}

        <motion.p
          className="mt-12 text-[11px] tracking-[0.14em]"
          style={{ color: "var(--ink-quiet)" }}
          variants={fadeUp}
        >
          {graceNote(briefing)}
        </motion.p>
      </motion.article>
    </MotionConfig>
  );
}

// fadeUp: page-settling entrance, not a feed pop. --motion-base (220ms).
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  shown: {
    opacity: 1,
    y: 0,
    // --motion-base 220ms + --ease-out
    transition: { duration: 0.22, ease: EASE_OUT },
  },
};

function Header({ stamp }: { stamp: string }) {
  return (
    <motion.div className="mb-6" variants={fadeUp}>
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: "var(--ink-quiet)" }}
      >
        Daily Signal · {stamp}
      </p>
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
      // --motion-base 220ms + --ease-standard (crossfade)
      transition={{ duration: 0.22, ease: EASE_STANDARD }}
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
        className="text-[12px] transition-colors"
        style={{
          color: open ? "var(--ink)" : "var(--ink-soft)",
        }}
        aria-expanded={open}
      >
        <motion.span
          className="inline-block"
          animate={{ rotate: open ? 90 : 0 }}
          // --motion-fast 140ms + --ease-out — micro-affordance
          transition={{ duration: 0.14, ease: EASE_OUT }}
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
            // --motion-moderate 320ms + --ease-out — accordion expand
            transition={{ duration: 0.32, ease: EASE_OUT }}
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
                      // --motion-base 220ms + --ease-out
                      transition: { duration: 0.22, ease: EASE_OUT },
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

function EmptyState({
  headline = "Nothing to flag today.",
  body = "No briefing email is sent on quiet days. The board is clear.",
}: {
  headline?: string;
  body?: string;
}) {
  return (
    <>
      <motion.div
        className="rounded-2xl border p-10 text-center"
        variants={fadeUp}
        style={{
          borderColor: "var(--hairline)",
          background: "var(--paper-soft)",
        }}
      >
        <p
          className="text-[18px] font-medium"
          style={{ color: "var(--ink)" }}
        >
          {headline}
        </p>
        <p
          className="mt-2 text-[14px]"
          style={{ color: "var(--ink-soft)" }}
        >
          {body}
        </p>
      </motion.div>

      {/* Quiet escape hatch — calm, not a CTA. No marketing register. */}
      <motion.p
        className="mt-6 text-center text-[12px] tracking-[0.01em]"
        style={{ color: "var(--ink-quiet)" }}
        variants={fadeUp}
      >
        Your next briefing builds tomorrow, 6am.{" "}
        <a
          href="https://tasks.signalstudio.ie/app"
          className="underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
          style={{ color: "var(--ink-quiet)" }}
        >
          Open the Tasks workspace
        </a>
      </motion.p>
    </>
  );
}

// greeting / summaryLine / graceNote moved to @/lib/briefing/voice
// (single source of truth across email/text/web).
