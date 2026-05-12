"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DOMAINS, type DomainId } from "@/lib/domains";
import {
  type DemoState,
  type Scene,
} from "./types";
import { BriefingItem } from "./briefing-item";
import { CapOverflow } from "./cap-overflow";
import { TickCursor } from "./tick-cursor";

function buildInitialState(domain: DomainId): DemoState {
  const pack = DOMAINS[domain];
  const variantByItemId: Record<string, number> = {};
  for (const block of pack.blocks) {
    for (const item of block.items) {
      variantByItemId[item.id] = 0;
    }
  }
  return {
    blocks: pack.blocks,
    scene: "boot",
    delivered: false,
    swappingItemId: null,
    variantByItemId,
    overflowVisible: [],
    domain,
  };
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Props = {
  domain?: DomainId;
};

export function AnalyticsDemo({ domain = "wedding" }: Props = {}) {
  const reducedMotion = useReducedMotion();
  const pack = DOMAINS[domain];
  const [state, setState] = useState<DemoState>(() => buildInitialState(domain));
  const aliveRef = useRef(true);
  const loopKeyRef = useRef(0);

  useEffect(() => {
    setState(buildInitialState(domain));
    loopKeyRef.current += 1;
  }, [domain]);

  const setScene = useCallback((scene: Scene) => {
    setState((s) => ({ ...s, scene }));
  }, []);

  const setSwapping = useCallback((id: string | null) => {
    setState((s) => ({ ...s, swappingItemId: id }));
  }, []);

  const swapVariant = useCallback((itemId: string) => {
    setState((s) => {
      const item = pack.blocks
        .flatMap((b) => b.items)
        .find((it) => it.id === itemId);
      if (!item) return s;
      const next = ((s.variantByItemId[itemId] ?? 0) + 1) % item.variants.length;
      return {
        ...s,
        variantByItemId: { ...s.variantByItemId, [itemId]: next },
      };
    });
  }, [pack]);

  const setOverflow = useCallback(
    (overflow: { id: string; text: string }[]) => {
      setState((s) => ({ ...s, overflowVisible: overflow }));
    },
    []
  );

  const setDelivered = useCallback((delivered: boolean) => {
    setState((s) => ({ ...s, delivered }));
  }, []);

  /** The scene timeline. */
  useEffect(() => {
    if (reducedMotion) return;
    aliveRef.current = true;
    const myLoopKey = loopKeyRef.current;
    const isCurrent = () =>
      aliveRef.current && myLoopKey === loopKeyRef.current;

    async function runLoop() {
      setState(buildInitialState(domain));
      await wait(1600);
      if (!isCurrent()) return;

      // Scene 1 — phrasing swap on the named item.
      setScene("phrasing-swap");
      setSwapping(pack.swapItemId);
      await wait(160);
      swapVariant(pack.swapItemId);
      await wait(2000);
      if (!isCurrent()) return;
      setSwapping(null);

      // Scene 2 — overflow attempt: extra items try to enter "Needs attention".
      const attentionBlock = pack.blocks.find((b) => b.id === "attention");
      if (attentionBlock?.overflow) {
        setScene("cap-attempt");
        setOverflow(attentionBlock.overflow);
        await wait(2200);
        if (!isCurrent()) return;

        setScene("cap-drop");
        await wait(700);
        if (!isCurrent()) return;
        setOverflow([]);
        await wait(900);
        if (!isCurrent()) return;
      }

      // Scene 3 — delivered pip.
      setScene("delivered");
      setDelivered(true);
      await wait(2200);
      if (!isCurrent()) return;

      // Scene 4 — second phrasing swap (different cadence).
      setSwapping(pack.swapItemId);
      await wait(120);
      swapVariant(pack.swapItemId);
      setSwapping(null);
      await wait(1400);
      if (!isCurrent()) return;

      // Scene 5 — reset.
      setScene("reset");
      setDelivered(false);
      await wait(1200);
    }

    let cancelled = false;
    (async function loop() {
      while (!cancelled && isCurrent()) {
        await runLoop();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    reducedMotion,
    domain,
    pack,
    setScene,
    setSwapping,
    swapVariant,
    setOverflow,
    setDelivered,
  ]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        borderRadius: "var(--r-4)",
        border: "1px solid var(--border)",
        background: "var(--bg-elev)",
        boxShadow: "var(--shadow-2, 0 2px 6px rgba(20,21,26,0.06))",
      }}
    >
      {/* Top bar — sender chrome */}
      <div
        className="flex items-center gap-3 border-b px-5 py-2.5"
        style={{
          borderColor: "var(--border-soft)",
          background: "var(--bg-deep)",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, var(--brand) 0%, var(--brand-deep) 100%)",
            color: "white",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.02em",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          S
        </span>
        <div className="flex flex-col flex-1 min-w-0">
          <span
            className="text-[12px]"
            style={{
              color: "var(--ink)",
              fontWeight: 600,
              letterSpacing: "-0.005em",
            }}
          >
            Signal Analytics
          </span>
          <span
            className="font-mono text-[10.5px]"
            style={{
              color: "var(--ink-quiet)",
              letterSpacing: "0.02em",
              textTransform: "lowercase",
            }}
          >
            for · {pack.workspaceName}
          </span>
        </div>
        <span
          className="rounded-full border px-2.5 py-1 text-[11px] font-medium"
          style={{
            borderColor: "var(--border-soft)",
            color: "var(--ink-soft)",
          }}
        >
          Briefing
        </span>
      </div>

      {/* Briefing body */}
      <motion.div
        initial={false}
        style={{
          padding: "32px 36px 36px",
        }}
      >
        {/* Timestamp + tick + delivered pip */}
        <div className="mb-5">
          <TickCursor delivered={state.delivered} />
        </div>

        {/* Greeting */}
        <p
          style={{
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: "-0.025em",
            color: "var(--ink)",
            marginBottom: 32,
            lineHeight: 1.1,
          }}
        >
          {pack.greeting}
        </p>

        {/* Blocks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {state.blocks.map((block) => (
            <div key={block.id}>
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

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingLeft: 14,
                }}
              >
                {block.items.map((item) => {
                  const variantIndex = state.variantByItemId[item.id] ?? 0;
                  const text = item.variants[variantIndex] ?? item.variants[0];
                  return (
                    <BriefingItem
                      key={item.id}
                      text={text}
                      variantKey={variantIndex}
                      swapping={state.swappingItemId === item.id}
                      provenance={item.provenance}
                    />
                  );
                })}
              </div>

              {block.id === "attention" ? (
                <CapOverflow
                  overflow={state.overflowVisible}
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
            marginTop: 32,
            paddingTop: 16,
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
    </div>
  );
}
