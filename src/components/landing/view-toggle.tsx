"use client";

import { motion, LayoutGroup } from "motion/react";

export type CadenceView = "today" | "yesterday";

type Props = {
  view: CadenceView;
  onChange?: (next: CadenceView) => void;
};

/**
 * Today | Yesterday pill toggle. Lets the loop morph between the briefing
 * snapshots so the viewer can see the engine's freshness — same engine,
 * different day, the lines have changed.
 */
export function ViewToggle({ view, onChange }: Props) {
  const items: { id: CadenceView; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
  ];

  return (
    <LayoutGroup id="analytics-view-toggle">
      <div
        role="tablist"
        aria-label="View"
        className="relative inline-flex items-center gap-0.5 rounded-full border p-0.5"
        style={{
          borderColor: "var(--border-soft)",
          background: "var(--bg-elev)",
        }}
      >
        {items.map((item) => {
          const isActive = item.id === view;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange?.(item.id)}
              className="relative inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
              style={{
                color: isActive ? "var(--ink)" : "var(--ink-quiet)",
              }}
            >
              {isActive ? (
                <motion.span
                  layoutId="analytics-view-pill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "var(--bg-deep)",
                    boxShadow: "inset 0 0 0 1px var(--border-soft)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
