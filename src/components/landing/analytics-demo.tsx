"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DOMAINS, type DomainId, type DemoBlock } from "@/lib/domains";
import {
  type CursorState,
  type DemoState,
  type Scene,
} from "./types";
import { BriefingItem } from "./briefing-item";
import { CapOverflow } from "./cap-overflow";
import { TickCursor } from "./tick-cursor";
import { Cursor } from "./cursor";
import { DemoToast } from "./toast";

const CURSOR_COLOR = "#4f46e5";

function emptyCursor(): CursorState {
  return {
    x: -30,
    y: 80,
    visible: false,
    reading: false,
    label: "reading",
  };
}

function buildInitialState(domain: DomainId): DemoState {
  const pack = DOMAINS[domain];
  const variantByItemId: Record<string, number> = {};
  for (const block of pack.blocks) {
    for (const item of block.items) {
      variantByItemId[item.id] = 0;
    }
  }
  return {
    scene: "boot",
    delivered: false,
    swappingItemId: null,
    variantByItemId,
    overflowVisible: [],
    whyThisItemId: null,
    whyThisReveal: 0,
    toast: null,
    cursor: emptyCursor(),
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
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const itemRefsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // The scene timeline is an infinite setTimeout chain. Gate it on
  // viewport visibility + tab visibility so it isn't burning the
  // main thread (and mobile battery) while scrolled off-screen or
  // backgrounded. The loop restarts cleanly when it re-enters view.
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    let onScreen = false;
    const recompute = () =>
      setActive(onScreen && document.visibilityState === "visible");
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        recompute();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    document.addEventListener("visibilitychange", recompute);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", recompute);
    };
  }, []);

  const onRegisterItem = useCallback(
    (id: string, el: HTMLDivElement | null) => {
      if (el) {
        itemRefsRef.current.set(id, el);
      } else {
        itemRefsRef.current.delete(id);
      }
    },
    []
  );

  const getItemCenter = useCallback(
    (itemId: string): { x: number; y: number } | null => {
      const surface = surfaceRef.current;
      const el = itemRefsRef.current.get(itemId);
      if (!surface || !el) return null;
      const surfaceRect = surface.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      return {
        x: elRect.left - surfaceRect.left + Math.min(elRect.width * 0.35, 220),
        y: elRect.top - surfaceRect.top + elRect.height * 0.5,
      };
    },
    []
  );

  const setScene = useCallback((scene: Scene) => {
    setState((s) => ({ ...s, scene }));
  }, []);

  const setSwapping = useCallback((id: string | null) => {
    setState((s) => ({ ...s, swappingItemId: id }));
  }, []);

  const swapVariant = useCallback(
    (itemId: string) => {
      setState((s) => {
        const item = pack.blocks
          .flatMap((b) => b.items)
          .find((it) => it.id === itemId);
        if (!item) return s;
        const next =
          ((s.variantByItemId[itemId] ?? 0) + 1) % item.variants.length;
        return {
          ...s,
          variantByItemId: { ...s.variantByItemId, [itemId]: next },
        };
      });
    },
    [pack]
  );

  const setOverflow = useCallback(
    (overflow: { id: string; text: string }[]) => {
      setState((s) => ({ ...s, overflowVisible: overflow }));
    },
    []
  );

  const setDelivered = useCallback((delivered: boolean) => {
    setState((s) => ({ ...s, delivered }));
  }, []);

  const setWhyThis = useCallback(
    (itemId: string | null, reveal = 0) => {
      setState((s) => ({
        ...s,
        whyThisItemId: itemId,
        whyThisReveal: reveal,
      }));
    },
    []
  );

  const setToast = useCallback((toast: DemoState["toast"]) => {
    setState((s) => ({ ...s, toast }));
  }, []);

  const setCursor = useCallback((patch: Partial<CursorState>) => {
    setState((s) => ({ ...s, cursor: { ...s.cursor, ...patch } }));
  }, []);

  const setCursorToItem = useCallback(
    (itemId: string, reading = false, label?: string) => {
      const center = getItemCenter(itemId);
      if (!center) {
        setCursor({ reading });
        return;
      }
      setCursor({ x: center.x, y: center.y, reading, label: label ?? "reading" });
    },
    [getItemCenter, setCursor]
  );

  /** Scene timeline. */
  useEffect(() => {
    if (reducedMotion) return;
    if (!active) return;
    aliveRef.current = true;
    const myLoopKey = loopKeyRef.current;
    const isCurrent = () =>
      aliveRef.current && myLoopKey === loopKeyRef.current;

    async function typeWhyThis(itemId: string) {
      const item = pack.blocks
        .flatMap((b) => b.items)
        .find((it) => it.id === itemId);
      if (!item?.whyThis) return;
      const lastLine = item.whyThis[item.whyThis.length - 1];
      for (let i = 1; i <= lastLine.length; i++) {
        if (!isCurrent()) return;
        setState((s) => ({ ...s, whyThisReveal: i }));
        await wait(24 + Math.random() * 18);
      }
    }

    async function runLoop() {
      setState(buildInitialState(domain));
      await wait(900);
      if (!isCurrent()) return;

      // Arrival — briefing already visible, "Delivered" pip fires
      setScene("arrival");
      await wait(900);
      if (!isCurrent()) return;
      setDelivered(true);
      setToast("delivered");
      await wait(1600);
      if (!isCurrent()) return;
      setToast(null);
      await wait(400);

      // Cursor arrives — drifts in from left edge
      setScene("cursor-arrive");
      setCursor({ visible: true, x: -20, y: 240 });
      await wait(280);
      setCursorToItem(pack.inspectItemId, false);
      await wait(900);
      if (!isCurrent()) return;

      // Cursor reads the item
      setScene("cursor-reads");
      setCursor({ reading: true });
      await wait(900);
      if (!isCurrent()) return;

      // "Why this?" expands beneath the inspected item
      setScene("why-this-open");
      setWhyThis(pack.inspectItemId, 0);
      await wait(800);
      if (!isCurrent()) return;

      setScene("why-this-typing");
      await typeWhyThis(pack.inspectItemId);
      if (!isCurrent()) return;
      await wait(1600);

      setScene("why-this-close");
      setWhyThis(null);
      setCursor({ reading: false });
      await wait(700);
      if (!isCurrent()) return;

      // Phrasing swap
      setScene("phrasing-swap");
      setSwapping(pack.swapItemId);
      await wait(160);
      swapVariant(pack.swapItemId);
      await wait(1800);
      if (!isCurrent()) return;
      setSwapping(null);

      // Cap overflow attempt
      const attentionBlock = pack.blocks.find((b) => b.id === "attention");
      if (attentionBlock?.overflow) {
        setScene("cap-attempt");
        setOverflow(attentionBlock.overflow);
        await wait(2000);
        if (!isCurrent()) return;
        setScene("cap-drop");
        await wait(600);
        if (!isCurrent()) return;
        setOverflow([]);
        await wait(700);
      }

      // The reader lets the briefing settle and steps away. No
      // acknowledge gesture, no Yesterday toggle — the shipped brief
      // has neither, so the demo holds the same line.
      setScene("cursor-leaves");
      setCursor({ visible: false, reading: false });
      await wait(700);
      if (!isCurrent()) return;

      setScene("reset");
      await wait(2200);
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
    active,
    domain,
    pack,
    setScene,
    setSwapping,
    swapVariant,
    setOverflow,
    setDelivered,
    setWhyThis,
    setToast,
    setCursor,
    setCursorToItem,
  ]);

  // One briefing per morning — there is no Yesterday view in the
  // shipped product, so there is none here either.
  const activeBlocks: DemoBlock[] = useMemo(
    () => pack.blocks,
    [pack]
  );

  return (
    <div
      ref={surfaceRef}
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
            Signal
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
      </div>

      {/* Briefing body — settle entrance, not a feed pop.
          --motion-moderate 320ms + --ease-out (JS mirror of contract). */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0, 0, 0.2, 1] }}
        style={{ padding: "32px 36px 36px" }}
      >
        <div className="mb-5">
          <TickCursor delivered={state.delivered} />
        </div>

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

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {activeBlocks.map((block) => (
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
                      itemId={item.id}
                      onRegister={onRegisterItem}
                      highlight={
                        state.cursor.reading &&
                        state.scene !== "cursor-leaves" &&
                        state.scene !== "reset" &&
                        (state.whyThisItemId === item.id ||
                          (state.scene !== "why-this-close" &&
                            item.id === pack.inspectItemId))
                      }
                      whyThisVisible={state.whyThisItemId === item.id}
                      whyThisReasons={item.whyThis}
                      whyThisReveal={state.whyThisReveal}
                      whyThisTrigger={item.triggerName}
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
            Daily briefing · 06:00
          </span>
        </div>
      </motion.div>

      {/* Cursor layer */}
      <div className="pointer-events-none absolute inset-0">
        <Cursor
          x={state.cursor.x}
          y={state.cursor.y}
          visible={state.cursor.visible}
          color={CURSOR_COLOR}
          label={state.cursor.label}
          reading={state.cursor.reading}
        />
      </div>

      <DemoToast variant={state.toast} />
    </div>
  );
}
