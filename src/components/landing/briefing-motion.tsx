"use client";

import { useReducedMotion, motion } from "motion/react";

const BRIEFING_SECTIONS = [
  {
    label: "Needs attention",
    dot: "#f59e0b",
    items: [
      "Website launch is blocked by missing assets",
      "4 overdue tasks are affecting campaign timing",
      "Workload increased sharply this week",
    ],
  },
  {
    label: "Moving well",
    dot: "#10b981",
    items: [
      "Client onboarding completed faster than usual",
      "Product roadmap is ahead of schedule",
    ],
  },
  {
    label: "Quiet risks",
    dot: "#71717a",
    items: [
      "One project has had no activity in 8 days",
      "72% of work depends on one person",
      "Friday deadline may slip",
    ],
  },
  {
    label: "Suggested focus",
    dot: "#4f46e5",
    items: [
      "Resolve homepage copy",
      "Reassign launch tasks",
      "Push roadmap review to next week",
    ],
  },
] as const;

export function BriefingMotion() {
  const reduced = useReducedMotion();

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
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          /* Hairline border — soft, not heavy */
          border: "1px solid var(--border-soft)",
          borderRadius: "var(--r-4)",
          padding: "48px 48px 56px",
          background: "var(--bg-elev)",
          boxShadow: "var(--shadow-1)",
        }}
      >
        {/* Timestamp label */}
        <p
          style={{
            fontSize: 11,
            fontFamily: "var(--font-mono-stack)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--ink-quiet)",
            marginBottom: 24,
          }}
        >
          Daily signal &middot; 09:14
        </p>

        {/* Greeting */}
        <p
          style={{
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: "-0.025em",
            color: "var(--ink)",
            marginBottom: 40,
            lineHeight: 1.1,
          }}
        >
          Good morning.
        </p>

        {/* Sections — 60ms stagger, 0.6s per section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {BRIEFING_SECTIONS.map((section, si) => (
            <motion.div
              key={section.label}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: si * 0.06,
              }}
            >
              {/* Section label */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: section.dot,
                    flexShrink: 0,
                  }}
                  aria-hidden
                />
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono-stack)",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--ink-quiet)",
                  }}
                >
                  {section.label}
                </span>
              </div>

              {/* Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 14 }}>
                {section.items.map((item) => (
                  <p
                    key={item}
                    style={{
                      fontSize: 16,
                      color: "var(--ink-soft)",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {item}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
