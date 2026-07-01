"use client";

import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Anatomy of a briefing — Signal' equivalent of Tasks' Anatomy of a
 * Card, Notes' Anatomy of a Note, and Timeline's Anatomy of an item.
 *
 * Same structural pattern as the siblings: demo on the left, numbered
 * ol on the right, eyebrow + section heading above. Six honest slots.
 *
 * Register: data-pulse. Slower than Tasks (no live presence), more
 * deliberate than Notes (briefing is a read, not a meditation). The
 * choreography is a guided tour — the spotlight moves through each
 * section without ever hiding content. SSR + reduced-motion + no-JS
 * all see the full briefing at rest with every bucket populated.
 *
 * Two earned beats happen on the card itself:
 *   - Load receipt resolves under the greeting
 *   - Cap bar (3/3 hard cap) ticks during the Needs-attention beat
 *   - Focus pip drops on Suggested-focus item 2, then "Why this?"
 *     expands inline — the only real product affordance the anatomy
 *     dramatises (because it teaches the briefing's depth)
 */

type Slot =
  | "timestamp"
  | "greeting"
  | "load"
  | "needs"
  | "moving"
  | "risks"
  | "focus";

const ANN: { slot: Slot; label: string; note: string }[] = [
  {
    slot: "timestamp",
    label: "Timestamp",
    note: "When the briefing fires. Same time each morning. Always one short read, never a feed.",
  },
  {
    slot: "greeting",
    label: "Greeting",
    note: "Plain-English opener. The briefing speaks like a person, not a dashboard.",
  },
  {
    slot: "load",
    label: "Load receipt",
    note: "One count that proves the compression. Source and consequence, never a dashboard tile.",
  },
  {
    slot: "needs",
    label: "Needs attention",
    note: "Shown when they matter: due and overdue dates, too much in flight, a crowded week ahead. Hard cap of three.",
  },
  {
    slot: "moving",
    label: "Moving well",
    note: "Quiet wins worth knowing. Calibrates against the noise of what's wrong.",
  },
  {
    slot: "risks",
    label: "Quiet risks",
    note: "What's invisible but accumulating. Stalled work and blockers that have outlasted reasonable waiting.",
  },
  {
    slot: "focus",
    label: "Suggested focus",
    note: "Three actions for today, compressed from the full picture. The signal, not the noise.",
  },
];

const EASE = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  glide: [0.32, 0.72, 0, 1] as const,
};
const SPRING_SNAP = { type: "spring" as const, stiffness: 340, damping: 28 };
const SPRING_SOFT = { type: "spring" as const, stiffness: 220, damping: 26 };

type Stage = {
  hi: Slot | null;
  // Cap bar progresses 0 → 3 during the Needs beat, then holds at 3
  capFill: number; // 0..3
  // Focus pip drops on Suggested focus item 2
  pip: boolean;
  // "Why this?" inline expansion under focus
  why: boolean;
};

const BASE: Stage = {
  hi: null,
  capFill: 3,
  pip: false,
  why: false,
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function useChoreography(active: boolean, reduced: boolean) {
  const [stage, setStage] = useState<Stage>(BASE);

  useEffect(() => {
    if (!active || reduced) {
      setStage(BASE);
      return;
    }
    let cancelled = false;
    // Only do the 0→3 cap-fill animation on the first iteration — that
    // beat is the "lesson". On subsequent loops, the cap stays at 3 and
    // Beat 3 just highlights the section. Prevents the every-iteration
    // 3→0 flash UXD flagged as a tic, not a beat.
    let firstLoop = true;

    const loop = async () => {
      while (!cancelled) {
        // Reset — keep capFill at 3 so the bar never drops publicly
        // on subsequent loops. Pip + why reset to false as before.
        setStage({ ...BASE, capFill: 3 });
        await wait(700);
        if (cancelled) return;

        // Beat 1 — timestamp
        setStage((s) => ({ ...s, hi: "timestamp" }));
        await wait(900);
        if (cancelled) return;

        // Beat 2 — greeting
        setStage((s) => ({ ...s, hi: "greeting" }));
        await wait(900);
        if (cancelled) return;

        // Beat 3 — needs attention. On first iteration, cap reads 0 → 3
        // to demonstrate the hard-cap promise. On subsequent iterations,
        // cap stays at 3 (already proved) and we just highlight.
        setStage((s) => ({ ...s, hi: "load" }));
        await wait(900);
        if (cancelled) return;

        if (firstLoop) {
          setStage((s) => ({ ...s, hi: "needs", capFill: 0 }));
          await wait(280);
          if (cancelled) return;
          setStage((s) => ({ ...s, capFill: 1 }));
          await wait(280);
          if (cancelled) return;
          setStage((s) => ({ ...s, capFill: 2 }));
          await wait(280);
          if (cancelled) return;
          setStage((s) => ({ ...s, capFill: 3 }));
          await wait(700);
          if (cancelled) return;
          firstLoop = false;
        } else {
          setStage((s) => ({ ...s, hi: "needs" }));
          await wait(1540);
          if (cancelled) return;
        }

        // Micro-breath — the briefing "takes a breath" between the
        // critical section and the positive signal. Differentiates the
        // data register from Notes's quieter loop and Tasks's reactive
        // cadence. 180ms of hi: null reads as deliberate, not idle.
        setStage((s) => ({ ...s, hi: null }));
        await wait(180);
        if (cancelled) return;

        // Beat 4 — moving well
        setStage((s) => ({ ...s, hi: "moving" }));
        await wait(1000);
        if (cancelled) return;

        // Beat 5 — quiet risks
        setStage((s) => ({ ...s, hi: "risks" }));
        await wait(1000);
        if (cancelled) return;

        // Beat 6 — suggested focus + pip drops
        setStage((s) => ({ ...s, hi: "focus", pip: true }));
        await wait(1100);
        if (cancelled) return;

        // Beat 7 — "Why this?" expands inline (the briefing's depth).
        // Held shorter (1100ms vs 1600) because the copy is only two
        // sentences — feels like a reveal, not a lesson.
        setStage((s) => ({ ...s, why: true }));
        await wait(1100);
        if (cancelled) return;

        // Long settle — let the visitor read the finished briefing
        setStage((s) => ({ ...s, hi: null }));
        await wait(2400);
        if (cancelled) return;
      }
    };

    loop();
    return () => {
      cancelled = true;
    };
  }, [active, reduced]);

  return stage;
}

function spotlightAnim(slot: Slot, active: Slot | null, choreoHi: Slot | null) {
  const effective = active ?? choreoHi;
  const on = effective === slot;
  const off = !!effective && effective !== slot;
  return {
    boxShadow: on
      ? "0 0 0 2px rgba(79,70,229,0.20), 0 8px 18px -8px rgba(79,70,229,0.35)"
      : "0 0 0 0px rgba(79,70,229,0), 0 0px 0px 0px rgba(79,70,229,0)",
    opacity: off ? 0.5 : 1,
    y: on ? -0.5 : 0,
  };
}

export function BriefingAnatomy() {
  const [active, setActive] = useState<Slot | null>(null);

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="anatomy"
        className="reveal"
        style={{ paddingTop: 120, paddingBottom: 120, scrollMarginTop: 96 }}
        aria-label="Anatomy of a briefing"
      >
        <div className="mx-auto w-full max-w-[1140px] px-6">
          {/* Eyebrow */}
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              fontWeight: 600,
              color: "var(--ink-quiet)",
              fontFamily: "var(--font-mono-stack)",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Anatomy of a briefing
          </p>

          {/* Title */}
          <h2 className="h-title" style={{ marginBottom: 20, maxWidth: "18ch" }}>
            A receipt,{" "}
            <span
              style={{
                color:
                  "color-mix(in srgb, var(--ink) 50%, transparent)",
              }}
            >
              then the read.
            </span>
          </h2>

          <p
            style={{
              maxWidth: "58ch",
              fontSize: 16,
              lineHeight: 1.55,
              color: "var(--ink-soft)",
              marginBottom: 12,
            }}
          >
            The Daily Signal opens with one count that proves the compression.
            Then the briefing speaks in plain English. Most sections stay quiet
            until the moment calls for them.
          </p>
          <p
            style={{
              maxWidth: "58ch",
              fontSize: 13,
              lineHeight: 1.55,
              color: "var(--ink-faint)",
              marginBottom: 48,
            }}
          >
            Watch the briefing read itself, or pick a line on the card or in
            the list to see how each part earns its place.
          </p>

          {/* Demo + annotations grid */}
          <div
            style={{
              display: "grid",
              gap: 48,
              gridTemplateColumns: "1fr",
            }}
            className="lg:grid-cols-[1.1fr_1fr] lg:gap-20"
          >
            <DemoCard active={active} setActive={setActive} />
            <Annotations active={active} setActive={setActive} />
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

/* ── Demo briefing card — all six sections visible at rest ─────── */
function DemoCard({
  active,
  setActive,
}: {
  active: Slot | null;
  setActive: (s: Slot | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // amount: 0.5 — section must be at least half-visible before the
  // loop starts. Prevents the hero AnalyticsDemo choreography from
  // running simultaneously with this one (UXD's dual-loop conflict).
  const inView = useInView(wrapRef, { amount: 0.5 });
  const reduced = useReducedMotion() ?? false;
  const stage = useChoreography(inView, reduced);

  const hoverProps = (s: Slot) => ({
    onMouseEnter: () => setActive(s),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(s),
    onBlur: () => setActive(null),
    tabIndex: 0,
    role: "group" as const,
    "aria-label": `Highlight ${s}`,
  });

  return (
    <div
      ref={wrapRef}
      className="relative flex items-center justify-center"
      style={{
        borderRadius: 24,
        border: "1px solid var(--border-soft)",
        background:
          "linear-gradient(180deg, var(--bg-elev) 0%, color-mix(in srgb, var(--bg-deep) 60%, var(--bg-elev)) 100%)",
        padding: "48px 24px",
      }}
      onMouseLeave={() => setActive(null)}
    >
      {/* Ambient indigo glow — intensifies on active or on Why-this expansion */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          borderRadius: 24,
          background:
            "radial-gradient(ellipse at top, rgba(79,70,229,0.10), transparent 60%)",
        }}
        animate={{ opacity: active || stage.why ? 1 : 0.55 }}
        transition={{ duration: 0.7, ease: EASE.inOut }}
      />

      <motion.div
        style={{
          width: 320,
          borderRadius: 14,
          border: "1px solid var(--border)",
          background: "#ffffff",
          padding: "16px 18px",
        }}
        animate={{
          y: active ? -2 : 0,
          scale: active ? 1.018 : 1,
          boxShadow: active
            ? "0 24px 50px -16px rgba(20,21,26,0.22), 0 0 0 1px rgba(20,21,26,0.05)"
            : "0 18px 44px -16px rgba(20,21,26,0.18), 0 0 0 1px rgba(20,21,26,0.04)",
        }}
        transition={SPRING_SOFT}
      >
        {/* Slot 1 — Timestamp */}
        <motion.div
          {...hoverProps("timestamp")}
          animate={spotlightAnim("timestamp", active, stage.hi)}
          transition={SPRING_SNAP}
          style={{
            borderRadius: 6,
            padding: "2px 6px",
            margin: "-2px -6px 10px",
          }}
        >
          <p
            style={{
              fontSize: 10.5,
              letterSpacing: "0.14em",
              fontWeight: 600,
              color: "var(--ink-quiet)",
              fontFamily: "var(--font-mono-stack)",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Daily Signal · 09:14
          </p>
        </motion.div>

        {/* Slot 2 — Greeting */}
        <motion.div
          {...hoverProps("greeting")}
          animate={spotlightAnim("greeting", active, stage.hi)}
          transition={SPRING_SNAP}
          style={{
            borderRadius: 8,
            padding: "2px 6px",
            margin: "-2px -6px 18px",
          }}
        >
          <h3
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
              margin: 0,
            }}
          >
            Good morning.
          </h3>
        </motion.div>

        {/* Slot 3 — Needs attention (with cap bar) */}
        <motion.div
          {...hoverProps("load")}
          animate={spotlightAnim("load", active, stage.hi)}
          transition={SPRING_SNAP}
          style={{
            borderRadius: 8,
            padding: "2px 6px",
            margin: "-10px -6px 18px",
          }}
        >
          <p
            style={{
              fontSize: 12,
              lineHeight: 1.45,
              fontWeight: 600,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            Moderate day. 3 signals surfaced from 18 active items.
          </p>
        </motion.div>

        <motion.div
          {...hoverProps("needs")}
          animate={spotlightAnim("needs", active, stage.hi)}
          transition={SPRING_SNAP}
          style={{
            borderRadius: 8,
            padding: "6px 8px",
            margin: "-6px -8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <BucketHeading
              dotColor="var(--status-flight)"
              label="Needs attention"
            />
            <CapBar fill={stage.capFill} />
          </div>
          <BucketItem>Website launch is blocked by missing assets</BucketItem>
          <BucketItem>Four overdue tasks affecting campaign timing</BucketItem>
          <BucketItem>Too much in flight for the next two days</BucketItem>
        </motion.div>

        <div style={{ height: 10 }} />

        {/* Slot 4 — Moving well */}
        <motion.div
          {...hoverProps("moving")}
          animate={spotlightAnim("moving", active, stage.hi)}
          transition={SPRING_SNAP}
          style={{
            borderRadius: 8,
            padding: "6px 8px",
            margin: "-6px -8px",
          }}
        >
          <BucketHeading
            dotColor="var(--status-shipped)"
            label="Moving well"
          />
          <BucketItem>Client onboarding completed faster than usual</BucketItem>
          <BucketItem>Timeline is ahead of schedule</BucketItem>
        </motion.div>

        <div style={{ height: 10 }} />

        {/* Slot 5 — Quiet risks */}
        <motion.div
          {...hoverProps("risks")}
          animate={spotlightAnim("risks", active, stage.hi)}
          transition={SPRING_SNAP}
          style={{
            borderRadius: 8,
            padding: "6px 8px",
            margin: "-6px -8px",
          }}
        >
          <BucketHeading dotColor="#a89a64" label="Quiet risks" />
          <BucketItem>Glenmara contract has been in Draft six days</BucketItem>
          <BucketItem>Last week's retro is still unwritten</BucketItem>
        </motion.div>

        <div style={{ height: 10 }} />

        {/* Slot 6 — Suggested focus (with pip + Why-this expansion) */}
        <motion.div
          {...hoverProps("focus")}
          animate={spotlightAnim("focus", active, stage.hi)}
          transition={SPRING_SNAP}
          style={{
            borderRadius: 8,
            padding: "6px 8px",
            margin: "-6px -8px",
          }}
        >
          <BucketHeading dotColor="var(--color-signal, #4f46e5)" label="Suggested focus" />
          <FocusItem index={0}>
            Send the launch assets so the team can ship
          </FocusItem>
          <FocusItem index={1} pip={stage.pip}>
            Block 90 mins for the planning brief
          </FocusItem>
          <FocusItem index={2}>
            Write the retro before Wednesday's roundup
          </FocusItem>

          {/* Why-this inline expansion */}
          <AnimatePresence initial={false}>
            {stage.why ? (
              <motion.div
                key="why"
                initial={{ opacity: 0, height: 0, y: -4 }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  y: 0,
                  transition: {
                    height: { duration: 0.32, ease: EASE.glide },
                    opacity: { duration: 0.28, ease: EASE.glide, delay: 0.05 },
                    y: { duration: 0.32, ease: EASE.glide },
                  },
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  y: -4,
                  transition: {
                    height: { duration: 0.24, ease: EASE.inOut },
                    opacity: { duration: 0.18 },
                  },
                }}
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid var(--border-soft)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 10.5,
                      letterSpacing: "0.12em",
                      fontWeight: 600,
                      color: "var(--color-signal, #4f46e5)",
                      fontFamily: "var(--font-mono-stack)",
                      textTransform: "uppercase",
                      margin: 0,
                      marginBottom: 4,
                    }}
                  >
                    Why this?
                  </p>
                  <p
                    style={{
                      fontSize: 12.5,
                      lineHeight: 1.5,
                      color: "var(--ink-soft)",
                      margin: 0,
                    }}
                  >
                    Planning brief blocks two overdue tasks. Doing it first
                    clears the path for the rest of the day.
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── Bucket sub-primitives ─────────────────────────────────────── */

function BucketHeading({
  dotColor,
  label,
}: {
  dotColor: string;
  label: string;
}) {
  return (
    <p
      style={{
        fontSize: 10.5,
        letterSpacing: "0.14em",
        fontWeight: 600,
        color: "var(--ink-quiet)",
        fontFamily: "var(--font-mono-stack)",
        textTransform: "uppercase",
        margin: 0,
        marginBottom: 6,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          borderRadius: 999,
          background: dotColor,
        }}
      />
      {label}
    </p>
  );
}

function BucketItem({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 13.5,
        lineHeight: 1.5,
        color: "var(--ink-soft)",
        margin: 0,
        marginBottom: 3,
      }}
    >
      {children}
    </p>
  );
}

function FocusItem({
  children,
  index,
  pip,
}: {
  children: React.ReactNode;
  index: number;
  pip?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 8,
        alignItems: "baseline",
        marginBottom: 4,
      }}
    >
      <span
        style={{
          position: "relative",
          fontSize: 10,
          fontFamily: "var(--font-mono-stack)",
          letterSpacing: "0.06em",
          color: "var(--ink-faint)",
          minWidth: 18,
        }}
      >
        {`0${index + 1}`.slice(-2)}
        {/* Focus pip — drops in on Suggested focus item 2 */}
        <AnimatePresence initial={false}>
          {pip ? (
            <motion.span
              key="pip"
              aria-hidden
              initial={{ opacity: 0, scale: 0.3, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.3, y: -4 }}
              transition={SPRING_SNAP}
              style={{
                position: "absolute",
                left: -10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 5,
                height: 5,
                borderRadius: 999,
                background: "var(--color-signal, #4f46e5)",
                boxShadow:
                  "0 0 0 3px color-mix(in srgb, var(--color-signal, #4f46e5) 18%, transparent)",
              }}
            />
          ) : null}
        </AnimatePresence>
      </span>
      <p
        style={{
          fontSize: 13.5,
          lineHeight: 1.5,
          color: "var(--ink-soft)",
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
}

/* ── Cap bar (3/3 hard-cap visualisation) ────────────────────── */

function CapBar({ fill }: { fill: number }) {
  const clamped = Math.max(0, Math.min(3, fill));
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 9.5,
        fontFamily: "var(--font-mono-stack)",
        letterSpacing: "0.06em",
        color: "var(--ink-faint)",
        textTransform: "uppercase",
      }}
      aria-label={`Cap ${clamped} of 3`}
    >
      <span style={{ fontVariantNumeric: "tabular-nums" }}>
        {clamped} / 3
      </span>
      <div style={{ display: "flex", gap: 2 }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            aria-hidden
            animate={{
              backgroundColor:
                i < clamped
                  ? "var(--color-signal, #4f46e5)"
                  : "var(--border-soft)",
              scale: i < clamped ? 1 : 0.85,
            }}
            transition={{ duration: 0.22, ease: EASE.glide }}
            style={{
              display: "inline-block",
              width: 7,
              height: 4,
              borderRadius: 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Annotations list ──────────────────────────────────────── */

function Annotations({
  active,
  setActive,
}: {
  active: Slot | null;
  setActive: (s: Slot | null) => void;
}) {
  return (
    <ol
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {ANN.map((a, i) => {
        const isOn = active === a.slot;
        const isOff = !!active && active !== a.slot;
        return (
          <li key={a.slot}>
            <motion.button
              type="button"
              onMouseEnter={() => setActive(a.slot)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(a.slot)}
              onBlur={() => setActive(null)}
              animate={{
                background: isOn
                  ? "rgba(79,70,229,0.05)"
                  : "rgba(79,70,229,0)",
                opacity: isOff ? 0.55 : 1,
              }}
              transition={{ duration: 0.22, ease: EASE.inOut }}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                alignItems: "start",
                gap: 12,
                width: "100%",
                textAlign: "left",
                border: "none",
                cursor: "default",
                padding: "12px 14px",
                borderRadius: 12,
                outline: "none",
              }}
            >
              <motion.span
                animate={{
                  borderColor: isOn
                    ? "rgba(79,70,229,0.55)"
                    : "var(--border-soft)",
                  backgroundColor: isOn
                    ? "rgba(79,70,229,0.95)"
                    : "#ffffff",
                  color: isOn ? "#ffffff" : "var(--ink-soft)",
                  scale: isOn ? 1.05 : 1,
                }}
                transition={SPRING_SNAP}
                style={{
                  marginTop: 2,
                  display: "inline-flex",
                  width: 24,
                  height: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  border: "1px solid var(--border-soft)",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {i + 1}
              </motion.span>
              <div>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 500,
                    color: "var(--ink)",
                  }}
                >
                  {a.label}
                </div>
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: "var(--ink-soft)",
                  }}
                >
                  {a.note}
                </div>
              </div>
            </motion.button>
          </li>
        );
      })}
    </ol>
  );
}
