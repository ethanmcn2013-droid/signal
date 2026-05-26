import { AnalyticsHeroLoader } from "@/components/landing/analytics-hero-loader";
import { Hero } from "@/components/landing/hero";
import { BriefingAnatomy } from "@/components/marketing/briefing-anatomy";

const PILLARS = [
  {
    title: "Attention Engine",
    description:
      "Stuck work, approaching deadlines, overloaded queues, crowded weeks, persistent blockers, just-shipped wins. No configuration.",
  },
  {
    title: "Briefings, not dashboards",
    description:
      "Never \"sprint velocity\" or \"workflow throughput\". Always \"this project has gone quiet\" or \"you're carrying too much active work\".",
  },
  {
    title: "Priority Compression",
    description:
      "Three items per block, hard cap. Items below the cap are dropped silently.",
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

/**
 * Analytics marketing homepage — structure:
 *   1. AnalyticsHeroLoader — "the bar appears" hero-card animation
 *   2. Hero                — product intro text + audience toggle + live briefing demo
 *   3. BriefingAnatomy     — anatomy of a briefing item
 *   4. Pillars             — three attention-engine pillars
 *   5. Anti-features       — what this isn't
 */
export default function HomePage() {
  return (
    <div style={{ background: "var(--bg)" }}>
      <AnalyticsHeroLoader />
      <Hero />
      <BriefingAnatomy />

      {/* ── Pillars ─────────────────────────────────────────────── */}
      <section
        className="reveal"
        style={{
          maxWidth: 860,
          margin: "0 auto",
          paddingTop: 120,
          paddingBottom: 120,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
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
          Pillars
        </p>

        <h2 className="h-title" style={{ marginBottom: 48 }}>
          Three things, on repeat.
        </h2>

        {/* R13: collapsed from a 3-col feature-grid (banned, DESIGN.md §10)
            to a numbered single-column typographic list — the atlas pattern.
            Left-aligned, bold title + paragraph, hairline-separated rows. */}
        <ol
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {PILLARS.map((pillar, i) => (
            <li
              key={pillar.title}
              style={{
                display: "flex",
                gap: 24,
                paddingTop: 28,
                paddingBottom: 28,
                borderTop: "1px solid var(--hairline)",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono-stack)",
                  fontWeight: 600,
                  color: "var(--ink-quiet)",
                  letterSpacing: "0.06em",
                  paddingTop: 3,
                  flexShrink: 0,
                  minWidth: 20,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: "var(--ink)",
                    marginBottom: 8,
                    marginTop: 0,
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
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── What this isn't ─────────────────────────────────────── */}
      <section
        className="reveal"
        style={{
          maxWidth: 760,
          margin: "0 auto",
          paddingTop: 0,
          paddingBottom: 120,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <p
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
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {ANTI_FEATURES.map((item) => (
            <p
              key={item.label}
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
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
