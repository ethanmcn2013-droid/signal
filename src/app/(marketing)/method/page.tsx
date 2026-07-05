import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Method, Signal",
  description:
    "How the briefing gets made. A rule engine, a library of phrasings written by hand, and one job: surface what matters today. No machine writes the words.",
  alternates: { canonical: "/method" },
};

const STEPS = [
  {
    label: "1 · Read",
    title: "Read the state of your work.",
    body:
      "The engine reads your Signal Tasks workspace. Tags become projects. Lanes become status. Assignees stay assignees. Nothing is invented, nothing is interpreted, the briefing only knows what your workspace already says.",
    detail:
      "Today the only source is Signal Tasks. Other sources will be added when they earn it.",
  },
  {
    label: "2 · Detect",
    title: "Look for ten patterns.",
    body:
      "Ten rules run across the read model. Work that's blocked. Due or overdue dates. Too much in flight at once. One thing waiting on another. Work picking up speed. A run of things shipped. A project gone quiet. Everything resting on one person. A deadline creeping closer. A blocker that keeps coming back. Each rule is named, each rule is auditable, each rule fires only when its condition is met.",
    detail:
      "Every rule has a threshold. Every threshold is published. No detection is fuzzy.",
  },
  {
    label: "3 · Compress",
    title: "Keep three. Drop the rest.",
    body:
      "Insights are ranked by cascade (does this slow other things?), irreversibility (can it be fixed in five minutes?), and proximity (does it matter today?). Each block is capped at three items. Anything below the cap is dropped silently, the briefing doesn't apologise for what it left out.",
    detail:
      "Silence is also signal. A short briefing means a calm day.",
  },
  {
    label: "4 · Write",
    title: "Pick a phrasing. From a library written by hand.",
    body:
      "Every sentence in the briefing comes from a curated prose library, dozens of phrasings, each written by a person, slot-filled with the names and numbers from the rule that fired. The engine never generates language. It picks language.",
    detail:
      "No machine writes these lines. Not today, not in v1. The brand is in the writing.",
  },
] as const;

/**
 * The ten triggers, from PRODUCT.md §5.1. Rendered as a mono-spaced
 * table (row 13). Threshold column. No prose around numbers, the table
 * is the prose.
 */
const TRIGGERS: { id: string; threshold: string; block: string }[] = [
  { id: "blocked",                     threshold: "≥ 2 days",                 block: "Needs attention" },
  { id: "overdue",                     threshold: "past due, not done",       block: "Needs attention" },
  { id: "overload",                    threshold: "> 8 tasks / one person",   block: "Needs attention" },
  { id: "dependency-stall",            threshold: "≥ 5 days, no activity",    block: "Needs attention" },
  { id: "momentum-positive",           threshold: "≥ 3 closes / 7 days",      block: "Moving well"     },
  { id: "streak",                      threshold: "≥ 5 closes / 7 days",      block: "Moving well"     },
  { id: "inactive-project",            threshold: "≥ 8 days",                 block: "Quiet risks"     },
  { id: "single-point-of-failure",     threshold: "> 70% on one person",      block: "Quiet risks"     },
  { id: "slow-burn-deadline",          threshold: "≤ 7 days, < 30% closed",   block: "Quiet risks"     },
  { id: "unresolved-recurring-block",  threshold: "≥ 3 recurrences",          block: "Quiet risks"     },
];

const REFUSALS = [
  {
    label: "Not a dashboard.",
    body:
      "Dashboards ask you to interpret. The briefing tells you what changed and what matters.",
  },
  {
    label: "Not a recommendation engine.",
    body:
      "The engine names things. It does not decide. The phrase \"Suggested focus\" is the strongest verb the briefing uses.",
  },
  {
    label: "Not an AI workspace.",
    body:
      "There is no model in the path. No agent. No copilot. A rule engine and a phrasing library, both auditable, both written by hand.",
  },
  {
    label: "Not exhaustive.",
    body:
      "Three items per block. Always three. If five things need attention, the engine ranks by cascade, then irreversibility, then proximity, keeps the top three, and trusts you to find the rest yourself.",
  },
] as const;

const PROSE_MAX = {
  maxWidth: 640,
  margin: "0 auto",
  paddingLeft: 24,
  paddingRight: 24,
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 11,
        letterSpacing: "0.14em",
        fontWeight: 600,
        color: "var(--ink-quiet)",
        fontFamily: "var(--font-mono-stack)",
        textTransform: "uppercase",
        marginBottom: 20,
      }}
    >
      {children}
    </p>
  );
}

export default function MethodPage() {
  return (
    <div style={{ background: "var(--bg)", paddingBottom: 120 }}>
      <section style={{ paddingTop: 96, paddingBottom: 56 }}>
        <div style={PROSE_MAX}>
          <Eyebrow>Method</Eyebrow>
          <h1
            className="h-display"
            style={{ marginBottom: 22 }}
          >
            How the briefing gets made.
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.55,
              color: "var(--ink-soft)",
              marginBottom: 12,
            }}
          >
            A rule engine, a curated library of phrasings, and one job: surface
            what matters today.
          </p>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--ink-quiet)",
            }}
          >
            Four steps. Every one of them is auditable. None of them is a guess.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 24, paddingBottom: 0 }}>
        <div style={PROSE_MAX}>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 56,
            }}
          >
            {STEPS.map((step) => (
              <li key={step.label}>
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    fontWeight: 600,
                    color: "var(--ink-quiet)",
                    fontFamily: "var(--font-mono-stack)",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  {step.label}
                </p>
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    color: "var(--ink)",
                    marginBottom: 12,
                    lineHeight: 1.2,
                  }}
                >
                  {step.title}
                </h2>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.65,
                    color: "var(--ink-soft)",
                    marginBottom: 10,
                  }}
                >
                  {step.body}
                </p>
                <p
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.65,
                    color: "var(--ink-quiet)",
                  }}
                >
                  {step.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Row 13, the ten triggers as a mono-spaced table. PRODUCT.md §5.1.
          Threshold column. No prose around the numbers. */}
      <section style={{ paddingTop: 96, paddingBottom: 0 }}>
        <div style={PROSE_MAX}>
          <Eyebrow>The ten rules</Eyebrow>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: "-0.025em",
              color: "var(--ink)",
              marginBottom: 12,
              lineHeight: 1.15,
            }}
          >
            Ten rules. Every threshold published.
          </h2>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--ink-quiet)",
              marginBottom: 28,
            }}
          >
            Each rule has a name, a number, and a block it fires into. Nothing
            fuzzy. Nothing learned.
          </p>
          <div
            role="table"
            aria-label="Ten triggers and their thresholds"
            style={{
              borderTop: "1px solid var(--border-soft)",
              borderBottom: "1px solid var(--border-soft)",
              fontFamily: "var(--font-mono-stack)",
              fontSize: 12.5,
              lineHeight: 1.5,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <div
              role="row"
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1.2fr 1fr",
                padding: "10px 0",
                borderBottom: "1px solid var(--border-soft)",
                fontSize: 10.5,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--ink-quiet)",
                fontWeight: 600,
              }}
            >
              <span role="columnheader">Rule</span>
              <span role="columnheader">Threshold</span>
              <span role="columnheader">Block</span>
            </div>
            {TRIGGERS.map((t, i) => (
              <div
                key={t.id}
                role="row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr 1.2fr 1fr",
                  padding: "10px 0",
                  borderBottom:
                    i === TRIGGERS.length - 1
                      ? "none"
                      : "1px solid var(--border-soft)",
                  color: "var(--ink-soft)",
                }}
              >
                <span role="cell" style={{ color: "var(--ink)" }}>{t.id}</span>
                <span role="cell">{t.threshold}</span>
                <span role="cell" style={{ color: "var(--ink-quiet)" }}>
                  {t.block}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 96, paddingBottom: 0 }}>
        <div style={PROSE_MAX}>
          <Eyebrow>What the method refuses</Eyebrow>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: "-0.025em",
              color: "var(--ink)",
              marginBottom: 36,
              lineHeight: 1.15,
            }}
          >
            Four things the engine does not do.
          </h2>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            {REFUSALS.map((r) => (
              <li
                key={r.label}
                style={{
                  borderTop: "1px solid var(--border-soft)",
                  paddingTop: 18,
                }}
              >
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: "var(--ink)",
                    marginBottom: 8,
                  }}
                >
                  {r.label}
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: "var(--ink-soft)",
                  }}
                >
                  {r.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ paddingTop: 96 }}>
        <div style={PROSE_MAX}>
          <p
            style={{
              fontSize: 14,
              color: "var(--ink-quiet)",
              marginBottom: 18,
            }}
          >
            See it in motion.
          </p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link
              href="/signal"
              style={{
                fontSize: 15,
                color: "var(--ink)",
                textDecoration: "underline",
                textDecorationColor: "var(--border-soft)",
                textUnderlineOffset: 4,
              }}
            >
              What&apos;s in a briefing
            </Link>
            <span style={{ color: "var(--ink-quiet)" }}>·</span>
            <Link
              href="/demo"
              style={{
                fontSize: 15,
                color: "var(--ink)",
                textDecoration: "underline",
                textDecorationColor: "var(--border-soft)",
                textUnderlineOffset: 4,
              }}
            >
              Thirty seconds
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
