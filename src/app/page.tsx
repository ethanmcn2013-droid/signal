"use client";

import { useReducedMotion, motion } from "motion/react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1], delay },
});

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
      "Team responsiveness improved",
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

const PILLARS = [
  {
    title: "Attention Engine",
    description:
      "Auto-detects blockers, stalled work, overload, dependency issues, momentum shifts, missed deadlines, inactive projects, bottlenecks. No configuration.",
  },
  {
    title: "Plain-English Insights",
    description:
      "Never \"sprint velocity\" or \"workflow throughput\". Always \"this project is slowing down\" or \"too much work landed this week\".",
  },
  {
    title: "Priority Compression",
    description:
      "\"Only 3 things matter today\" instead of \"84 tasks\". The signal, not the noise.",
  },
] as const;

const ANTI_FEATURES = [
  {
    label: "Not a dashboard.",
    rebuttal: "Dashboards ask you to interpret. This tells you.",
  },
  {
    label: "Not productivity tracking.",
    rebuttal: "Counting tasks doesn't make work move.",
  },
  {
    label: "Not enterprise software.",
    rebuttal:
      "No projects to configure, no roles to define, no reports to schedule.",
  },
] as const;

export default function HomePage() {
  const reduced = useReducedMotion();

  const m = (delay: number) =>
    reduced
      ? {}
      : fade(delay);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 760,
          margin: "0 auto",
          paddingTop: 120,
          paddingBottom: 96,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <motion.div {...m(0)}>
          <Wordmark size="1rem" />
        </motion.div>

        <motion.p
          {...m(0.06)}
          style={{
            marginTop: 40,
            fontSize: 11,
            letterSpacing: "0.14em",
            fontWeight: 600,
            color: "var(--ink-quiet)",
            fontFamily: "var(--font-mono-stack)",
            textTransform: "uppercase",
          }}
        >
          Operational clarity · not a dashboard
        </motion.p>

        <motion.h1 {...m(0.12)} className="h-display" style={{ marginTop: 16 }}>
          What needs your attention?
        </motion.h1>

        <motion.p
          {...m(0.18)}
          style={{
            marginTop: 24,
            fontSize: 17,
            color: "var(--ink-soft)",
            lineHeight: 1.55,
            maxWidth: 520,
          }}
        >
          Signal Analytics turns the work happening across your team into a
          short briefing. What needs you. What&apos;s moving. What&apos;s quiet.
          What to do next.
        </motion.p>

        <motion.div {...m(0.24)} style={{ marginTop: 32 }}>
          <Link
            href="#briefing"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--ink)",
              textDecoration: "none",
              borderBottom: "1px solid var(--border)",
              paddingBottom: 2,
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color =
                "var(--ink-quiet)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "var(--border-soft)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--ink)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "var(--border)";
            }}
          >
            See an example briefing →
          </Link>
        </motion.div>
      </section>

      {/* ── Daily Signal demo ──────────────────────────────────── */}
      <section
        id="briefing"
        style={{
          paddingTop: 80,
          paddingBottom: 80,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            border: "1px solid var(--border-soft)",
            borderRadius: "var(--r-3)",
            padding: 40,
            background: "var(--bg-elev)",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono-stack)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--ink-quiet)",
              marginBottom: 20,
            }}
          >
            Daily signal · 09:14
          </p>

          <p
            style={{
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
              marginBottom: 36,
            }}
          >
            Good morning, Ethan.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {BRIEFING_SECTIONS.map((section, si) => (
              <motion.div
                key={section.label}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                  delay: si * 0.08,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
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
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "var(--ink)",
                    }}
                  >
                    {section.label}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {section.items.map((item) => (
                    <p
                      key={item}
                      style={{
                        fontSize: 16,
                        color: "var(--ink-soft)",
                        lineHeight: 1.55,
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

      {/* ── Pillars ────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 860,
          margin: "0 auto",
          paddingTop: 96,
          paddingBottom: 96,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
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
          Pillars
        </motion.p>

        <motion.h2
          initial={reduced ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="h-title"
          style={{ marginBottom: 56 }}
        >
          Three things, on repeat.
        </motion.h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 32,
          }}
        >
          {PILLARS.map((pillar, pi) => (
            <motion.div
              key={pillar.title}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                delay: pi * 0.08,
              }}
            >
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--ink)",
                  marginBottom: 10,
                }}
              >
                {pillar.title}
              </p>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--ink-soft)",
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── What this isn't ────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 760,
          margin: "0 auto",
          paddingTop: 80,
          paddingBottom: 96,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            fontWeight: 600,
            color: "var(--ink-quiet)",
            fontFamily: "var(--font-mono-stack)",
            textTransform: "uppercase",
            marginBottom: 48,
          }}
        >
          What this isn&apos;t
        </motion.p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {ANTI_FEATURES.map((item, ai) => (
            <motion.p
              key={item.label}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: ai * 0.06,
              }}
              style={{
                fontSize: 16,
                lineHeight: 1.55,
                margin: 0,
                color: "var(--ink-soft)",
              }}
            >
              <span
                style={{
                  textDecoration: "line-through",
                  textDecorationColor: "var(--ink-quiet)",
                  color: "var(--ink)",
                }}
              >
                {item.label}
              </span>{" "}
              {item.rebuttal}
            </motion.p>
          ))}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--border-soft)",
          paddingTop: 24,
          paddingBottom: 24,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div
          style={{
            maxWidth: 860,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Wordmark size="0.8125rem" />
          <nav
            style={{
              display: "flex",
              gap: 20,
              fontSize: 11.5,
              fontFamily: "var(--font-mono-stack)",
              color: "var(--ink-quiet)",
            }}
          >
            <Link
              href="/pricing"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              About
            </Link>
            <a
              href="https://signalstudio.ie"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              signalstudio.ie
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
