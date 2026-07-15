"use client";

import { motion, LayoutGroup } from "motion/react";
import { DOMAINS, DOMAIN_ORDER, type DomainId } from "@/lib/domains";

type Props = {
  domain: DomainId;
  onChange: (next: DomainId) => void;
};

/**
 * Audience picker for the Analytics cinematic briefing.
 *
 * Recut 2026-07-07 into the broadsheet register set by TheBriefHero: the
 * floating pill tab-list became a newspaper section rail. Mono uppercase
 * labels sit on a shared hairline; the active section carries a 2px indigo
 * rule that slides between tabs via motion's layoutId. Same radiogroup
 * semantics, same keyboard loop, same spring.
 */
export function AudienceToggle({ domain, onChange }: Props) {
  const active = DOMAINS[domain];

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          className="font-mono text-[11px] font-semibold uppercase"
          style={{
            color: "var(--ink-quiet)",
            letterSpacing: "0.18em",
          }}
        >
          Built for
        </span>
        <span
          className="text-[12.5px]"
          style={{ color: "var(--ink-soft)" }}
        >
          {active.description}
        </span>
      </div>

      <LayoutGroup id="analytics-audience-toggle">
        <div
          role="radiogroup"
          aria-label="Choose an audience"
          onKeyDown={(e) => {
            const dirs: Record<string, number> = {
              ArrowRight: 1,
              ArrowDown: 1,
              ArrowLeft: -1,
              ArrowUp: -1,
            };
            const step = dirs[e.key];
            if (!step) return;
            e.preventDefault();
            e.stopPropagation();
            const i = DOMAIN_ORDER.indexOf(domain);
            const nextIndex =
              (i + step + DOMAIN_ORDER.length) % DOMAIN_ORDER.length;
            const next = DOMAIN_ORDER[nextIndex];
            const radios = e.currentTarget.querySelectorAll<HTMLButtonElement>(
              '[role="radio"]',
            );
            onChange(next);
            radios[nextIndex]?.focus();
          }}
          className="relative inline-flex flex-wrap items-center gap-x-6 gap-y-1"
          style={{
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          {DOMAIN_ORDER.map((id) => {
            const pack = DOMAINS[id];
            const isActive = id === domain;
            return (
              <button
                key={id}
                role="radio"
                aria-checked={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onChange(id)}
                className="relative inline-flex items-center pb-2.5 pt-1 font-mono text-[10.5px] font-semibold uppercase transition-colors"
                style={{
                  letterSpacing: "0.14em",
                  color: isActive ? "var(--ink)" : "var(--ink-faint)",
                }}
              >
                {isActive ? (
                  <motion.span
                    aria-hidden
                    layoutId="analytics-audience-rule"
                    className="absolute inset-x-0 -bottom-px"
                    style={{
                      height: 2,
                      background: "var(--accent)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 360,
                      damping: 30,
                    }}
                  />
                ) : null}
                <span className="relative z-10">{pack.label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
