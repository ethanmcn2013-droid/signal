"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  BLOCK_DOT,
  BLOCK_LABEL,
  type Block,
  type BlockId,
  type DemoState,
  type Scene,
} from "./types";
import { BriefingItem } from "./briefing-item";
import { CapOverflow } from "./cap-overflow";
import { TickCursor } from "./tick-cursor";

const SEED_BLOCKS: Block[] = [
  {
    id: "attention",
    label: BLOCK_LABEL.attention,
    dot: BLOCK_DOT.attention,
    items: [
      {
        id: "florist",
        variantIndex: 0,
        variants: [
          "Florist deposit has been held up since March 2",
          "Florist hasn't confirmed since March 2",
          "Florist needs the deposit moved before Friday",
        ],
      },
      {
        id: "catering",
        variantIndex: 0,
        variants: ["Catering tasting needs a final headcount by Friday"],
      },
      {
        id: "invitations",
        variantIndex: 0,
        variants: ["Invitations are 14 days overdue"],
      },
    ],
    overflow: [],
  },
  {
    id: "moving",
    label: BLOCK_LABEL.moving,
    dot: BLOCK_DOT.moving,
    items: [
      {
        id: "rsvps",
        variantIndex: 0,
        variants: ["Save-the-dates landed at 96 confirmed RSVPs"],
      },
      {
        id: "venue",
        variantIndex: 0,
        variants: ["Venue contract signed three weeks ahead of plan"],
      },
    ],
    overflow: [],
  },
  {
    id: "risks",
    label: BLOCK_LABEL.risks,
    dot: BLOCK_DOT.risks,
    items: [
      {
        id: "music",
        variantIndex: 0,
        variants: ["Music supplier hasn't replied in 9 days"],
      },
      {
        id: "hair",
        variantIndex: 0,
        variants: ["Hair-and-makeup trial overlaps with rehearsal dinner"],
      },
      {
        id: "honeymoon",
        variantIndex: 0,
        variants: ["Honeymoon flights still unbooked at 47 days out"],
      },
    ],
    overflow: [],
  },
  {
    id: "focus",
    label: BLOCK_LABEL.focus,
    dot: BLOCK_DOT.focus,
    items: [
      {
        id: "florist-focus",
        variantIndex: 0,
        variants: ["Confirm florist deposit Monday"],
      },
      {
        id: "headcount-focus",
        variantIndex: 0,
        variants: ["Send catering headcount by Friday"],
      },
      {
        id: "music-focus",
        variantIndex: 0,
        variants: ["Chase music supplier this week"],
      },
    ],
    overflow: [],
  },
];

const OVERFLOW_ATTEMPT = [
  { id: "diet", text: "Guest dietary requirements not collected" },
  { id: "officiant", text: "Officiant rehearsal not scheduled" },
];

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function AnalyticsDemo() {
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<DemoState>({
    blocks: SEED_BLOCKS,
    scene: "boot",
    delivered: false,
  });
  const aliveRef = useRef(true);
  const [swappingItemId, setSwappingItemId] = useState<string | null>(null);

  const setScene = useCallback((scene: Scene) => {
    setState((s) => ({ ...s, scene }));
  }, []);

  const swapVariant = useCallback((itemId: string) => {
    setState((s) => ({
      ...s,
      blocks: s.blocks.map((b) => ({
        ...b,
        items: b.items.map((it) => {
          if (it.id !== itemId) return it;
          const next = (it.variantIndex + 1) % it.variants.length;
          return { ...it, variantIndex: next };
        }),
      })),
    }));
  }, []);

  const setOverflow = useCallback(
    (blockId: BlockId, overflow: { id: string; text: string }[]) => {
      setState((s) => ({
        ...s,
        blocks: s.blocks.map((b) =>
          b.id === blockId ? { ...b, overflow } : b
        ),
      }));
    },
    []
  );

  const setDelivered = useCallback((delivered: boolean) => {
    setState((s) => ({ ...s, delivered }));
  }, []);

  /** The scene timeline. Loops indefinitely while alive. */
  useEffect(() => {
    if (reducedMotion) return;
    aliveRef.current = true;

    async function runLoop() {
      // Reset to known state.
      setState({
        blocks: SEED_BLOCKS,
        scene: "boot",
        delivered: false,
      });
      setSwappingItemId(null);
      await wait(1800);
      if (!aliveRef.current) return;

      // Scene 1 — phrasing swap on the florist line.
      setScene("phrasing-swap");
      setSwappingItemId("florist");
      await wait(160);
      swapVariant("florist");
      await wait(2200);
      if (!aliveRef.current) return;
      setSwappingItemId(null);

      // Scene 2 — overflow attempt: two items try to enter "Needs attention".
      setScene("cap-attempt");
      setOverflow("attention", OVERFLOW_ATTEMPT);
      await wait(2400);
      if (!aliveRef.current) return;

      // Scene 3 — silent drop.
      setScene("cap-drop");
      await wait(700);
      if (!aliveRef.current) return;
      setOverflow("attention", []);
      await wait(1000);
      if (!aliveRef.current) return;

      // Scene 4 — delivered pip.
      setScene("delivered");
      setDelivered(true);
      await wait(2400);
      if (!aliveRef.current) return;

      // Scene 5 — second phrasing swap (different item, shows it's a system).
      setSwappingItemId("invitations");
      await wait(120);
      // Single-variant items don't swap visually — pick one that has variants.
      swapVariant("florist");
      setSwappingItemId(null);
      await wait(1400);
      if (!aliveRef.current) return;

      // Scene 6 — reset quietly.
      setScene("reset");
      setDelivered(false);
      await wait(1400);
      if (!aliveRef.current) return;
    }

    let cancelled = false;
    (async function loop() {
      while (!cancelled && aliveRef.current) {
        await runLoop();
      }
    })();

    return () => {
      cancelled = true;
      aliveRef.current = false;
    };
  }, [reducedMotion, setScene, swapVariant, setOverflow, setDelivered]);

  return (
    <section
      id="briefing"
      style={{
        paddingTop: 120,
        paddingBottom: 120,
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          maxWidth: 640,
          margin: "0 auto",
          border: "1px solid var(--border-soft)",
          borderRadius: "var(--r-4)",
          padding: "40px 44px 44px",
          background: "var(--bg-elev)",
          boxShadow: "var(--shadow-1, 0 1px 2px rgba(0,0,0,0.04))",
        }}
      >
        {/* Timestamp + tick + delivered */}
        <div className="mb-6">
          <TickCursor delivered={state.delivered} />
        </div>

        {/* Greeting */}
        <p
          style={{
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: "-0.025em",
            color: "var(--ink)",
            marginBottom: 36,
            lineHeight: 1.1,
          }}
        >
          Good morning.
        </p>

        {/* Blocks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          {state.blocks.map((block) => (
            <div key={block.id}>
              {/* Block label */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: block.dot,
                    flexShrink: 0,
                  }}
                />
                <span
                  className="font-mono text-[11px] font-semibold uppercase"
                  style={{
                    color: "var(--ink-quiet)",
                    letterSpacing: "0.12em",
                  }}
                >
                  {block.label}
                </span>
              </div>

              {/* Items */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  paddingLeft: 14,
                }}
              >
                {block.items.map((item) => (
                  <BriefingItem
                    key={item.id}
                    item={item}
                    swapping={swappingItemId === item.id}
                  />
                ))}
              </div>

              {/* Overflow under "Needs attention" only */}
              {block.id === "attention" ? (
                <CapOverflow
                  overflow={block.overflow}
                  phase={
                    state.scene === "cap-attempt"
                      ? "attempt"
                      : state.scene === "cap-drop"
                      ? "drop"
                      : "hidden"
                  }
                />
              ) : null}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 36,
            paddingTop: 18,
            borderTop: "1px solid var(--border-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span
            className="font-mono text-[11px] uppercase"
            style={{
              color: "var(--ink-faint)",
              letterSpacing: "0.12em",
            }}
          >
            Three items per block. Hard cap.
          </span>
          <span
            className="font-mono text-[11px] uppercase"
            style={{
              color: "var(--ink-faint)",
              letterSpacing: "0.12em",
            }}
          >
            hello@signalstudio.ie
          </span>
        </div>
      </motion.div>
    </section>
  );
}
