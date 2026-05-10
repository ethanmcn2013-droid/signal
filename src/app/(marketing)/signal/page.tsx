import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Daily Signal — Signal Analytics",
  description:
    "Not a report. Not a feed. A briefing written for the person who needs to make decisions today.",
};

const BLOCKS = [
  {
    label: "Needs attention",
    dot: "#f59e0b",
    body: "The things that will slow you down if left alone. Blocked tasks, overdue work, dependency failures, projects that have gone quiet. Two or three items at most. If it is not actively costing you something, it does not appear here.",
  },
  {
    label: "Moving well",
    dot: "#10b981",
    body: "Quiet wins. Where momentum is. A project on a run of completion. A person shipping more than usual. The briefing names these so you know what's working and leave it alone.",
  },
  {
    label: "Quiet risks",
    dot: "#71717a",
    body: "Nothing is on fire. But something might be. A project that has gone silent for over a week. Most of a project's work sitting on one person. The same blocker holding up several pieces of work. Quiet risks are the ones dashboards miss.",
  },
  {
    label: "Suggested focus",
    dot: "#4f46e5",
    body: "One to three things worth doing today. Not a ranked list of all open tasks. A considered read of what is blocked, what is late, and where effort would do the most before the day ends.",
  },
] as const;

const DAILY_CADENCE = {
  label: "Daily",
  when: "Every morning. Two minutes.",
  what: "A snapshot of where the work stands today. What blocked overnight, what shipped, what needs a decision before noon. Read it before your first meeting.",
  why: "Most of what matters in a day is visible by 9am. The Signal reads it so you don't have to.",
} as const;

const COMING_CADENCES = [
  { label: "Weekly", when: "Every Friday." },
  { label: "Launch", when: "Before you ship." },
] as const;

const BRIEFING_EXAMPLE = [
  {
    label: "Needs attention",
    dot: "#f59e0b",
    items: [
      "Vendor quote signoff has been quiet for 8 days, and Confirm flowers is held up by it.",
      "Send save-the-dates was due 5 days ago.",
      "Print menus has been blocked for 3 days.",
    ],
  },
  {
    label: "Moving well",
    dot: "#10b981",
    items: [
      "Brand refresh has shipped 4 things this week.",
      "You closed 5 things this week.",
    ],
  },
  {
    label: "Quiet risks",
    dot: "#71717a",
    items: [
      "Vendor quote signoff is in the way of 3 other things.",
      "Most of Q3 launch is sitting on one person.",
      "Studio website has had no activity in 9 days.",
    ],
  },
  {
    label: "Suggested focus",
    dot: "#4f46e5",
    items: [
      "Chase Vendor quote signoff today — Confirm flowers is waiting on it.",
      "Close out Send save-the-dates today — it was due 5 days ago.",
      "Touch Studio website today — silent for 9 days.",
    ],
  },
] as const;

const SECTION_GAP = { paddingTop: 120, paddingBottom: 0 };
const PROSE_MAX = { maxWidth: 640, margin: "0 auto", paddingLeft: 24, paddingRight: 24 };

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

export default function SignalPage() {
  return (
    <div style={{ background: "var(--bg)", paddingBottom: 120 }}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section style={{ ...SECTION_GAP, paddingTop: 120 }}>
        <div style={PROSE_MAX}>
          <Eyebrow>The Daily Signal</Eyebrow>
          <h1 className="h-display" style={{ marginBottom: 28 }}>
            Your day, before you read it.
          </h1>
          <p style={{ fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.6, maxWidth: 520 }}>
            The Daily Signal is a short written briefing. It reads what&apos;s in your Signal
            Tasks workspace and writes the brief. Two minutes. Plain sentences. Everything
            that matters, nothing that doesn&apos;t.
          </p>
        </div>
      </section>

      {/* ── What's in a briefing ─────────────────────────────────── */}
      <section style={{ ...SECTION_GAP, paddingTop: 120 }}>
        <div style={PROSE_MAX}>
          <Eyebrow>What&apos;s in a briefing</Eyebrow>
          <h2 className="h-title" style={{ marginBottom: 56 }}>
            Four blocks. Every time.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {BLOCKS.map((block) => (
              <div key={block.label}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: block.dot,
                      flexShrink: 0,
                    }}
                    aria-hidden
                  />
                  <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>
                    {block.label}
                  </span>
                </div>
                <p style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.65, margin: 0 }}>
                  {block.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cadences ─────────────────────────────────────────── */}
      <section style={{ ...SECTION_GAP, paddingTop: 120 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", paddingLeft: 24, paddingRight: 24 }}>
          <Eyebrow>Cadences</Eyebrow>
          <h2 className="h-title" style={{ marginBottom: 16, maxWidth: 480 }}>
            One briefing format. One cadence now.
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "var(--ink-quiet)",
              lineHeight: 1.55,
              marginBottom: 48,
              maxWidth: 480,
            }}
          >
            Daily ships today. Weekly and Launch are designed — not yet live.
          </p>

          {/* Daily — fully shipping */}
          <div
            style={{
              border: "1px solid var(--border-soft)",
              borderRadius: "var(--r-3)",
              padding: 32,
              background: "var(--bg-elev)",
              maxWidth: 480,
              marginBottom: 24,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono-stack)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--ink-quiet)",
                marginBottom: 12,
              }}
            >
              {DAILY_CADENCE.when}
            </p>
            <p style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", marginBottom: 16 }}>
              {DAILY_CADENCE.label}
            </p>
            <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 20 }}>
              {DAILY_CADENCE.what}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--ink-quiet)",
                lineHeight: 1.5,
                fontStyle: "italic",
                margin: 0,
              }}
            >
              {DAILY_CADENCE.why}
            </p>
          </div>

          {/* Weekly + Launch — coming, muted */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {COMING_CADENCES.map((c) => (
              <div
                key={c.label}
                style={{
                  border: "1px solid var(--border-soft)",
                  borderRadius: "var(--r-3)",
                  padding: "20px 24px",
                  opacity: 0.45,
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                  minWidth: 180,
                }}
              >
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--ink)",
                    margin: 0,
                  }}
                >
                  {c.label}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono-stack)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--ink-quiet)",
                    margin: 0,
                  }}
                >
                  Coming
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── An example morning ───────────────────────────────────── */}
      <section style={{ ...SECTION_GAP, paddingTop: 120 }}>
        <div style={PROSE_MAX}>
          <Eyebrow>An example morning</Eyebrow>
          <div
            style={{
              border: "1px solid var(--border-soft)",
              borderRadius: "var(--r-3)",
              padding: "40px 40px 44px",
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
                marginBottom: 24,
              }}
            >
              Tuesday · 07:42
            </p>
            <p
              style={{
                fontSize: 26,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
                marginBottom: 40,
              }}
            >
              Good morning.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {BRIEFING_EXAMPLE.map((section) => (
                <div key={section.label}>
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
                      style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}
                    >
                      {section.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {section.items.map((item) => (
                      <p
                        key={item}
                        style={{
                          fontSize: 16,
                          color: "var(--ink-soft)",
                          lineHeight: 1.55,
                          margin: 0,
                          paddingLeft: 14,
                          borderLeft: "1px solid var(--border-soft)",
                        }}
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What it doesn't include ──────────────────────────────── */}
      <section style={{ ...SECTION_GAP, paddingTop: 96 }}>
        <div style={PROSE_MAX}>
          <Eyebrow>What it doesn&apos;t include</Eyebrow>
          <p style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.7, maxWidth: 520 }}>
            No raw metrics. No graphs. No counts. The Signal does not surface every
            change since you last looked, does not say &ldquo;FYI&rdquo;, does not pad
            its length with information you already have. If something is not worth your
            attention today, it is not in the briefing.
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 96, paddingBottom: 0 }}>
        <div style={PROSE_MAX}>
          <div
            style={{
              borderTop: "1px solid var(--border-soft)",
              paddingTop: 48,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono-stack)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--ink-quiet)",
                marginBottom: 16,
              }}
            >
              Private beta
            </p>
            <p style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.6 }}>
              Signal is in private beta.{" "}
              <a
                href="mailto:hello@signalstudio.ie"
                style={{ color: "var(--ink)", textDecoration: "underline" }}
              >
                Request access
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
