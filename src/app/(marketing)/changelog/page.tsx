import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog — Signal",
  description:
    "What shipped, when it shipped, and nothing else.",
};

const ENTRIES: {
  date: string;
  items: { line: string; sub?: string }[];
}[] = [
  {
    date: "10 May 2026",
    items: [
      {
        line: "Demo embed lands as a typography piece.",
        sub: "30 seconds. Silence is the signal. Voice and receipt follow.",
      },
      {
        line: "Cadences are honest.",
        sub: "Daily ships. Weekly and Launch are designed — not yet live. /signal says so.",
      },
      {
        line: "Briefing arrives before your day starts.",
        sub: "06:00 UTC. The subhead said seven. Now it doesn't.",
      },
      {
        line: "Moving well stays within the cap.",
        sub: "Hard cap of three items per block. Moving well had one too many. It doesn't now.",
      },
    ],
  },
  {
    date: "9 May 2026",
    items: [
      {
        line: "Signal is live.",
        sub: "11 public routes. Sticky nav, four-column footer, cross-product chrome.",
      },
      {
        line: "The engine reads from your Tasks.",
        sub: "Tag-as-project. One task can carry multiple. Read-only — the engine cannot write.",
      },
      {
        line: "Briefings arrive by email.",
        sub: "Daily, at 06:00 UTC. Four blocks. Hard cap of three items each.",
      },
      {
        line: "Security headers in place.",
        sub: "HSTS, X-Frame-Options, Content-Security-Policy (report-only).",
      },
      {
        line: "Favicons ship across the suite.",
        sub: "icon.tsx and apple-icon.tsx. Everything looks right in the tab and on the home screen.",
      },
    ],
  },
];

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

export default function ChangelogPage() {
  return (
    <div style={{ background: "var(--bg)", paddingBottom: 120 }}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 120, paddingBottom: 0 }}>
        <div style={PROSE_MAX}>
          <Eyebrow>Changelog</Eyebrow>
          <h1 className="h-display" style={{ marginBottom: 28 }}>
            What shipped.
          </h1>
          <p style={{ fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.6, maxWidth: 480 }}>
            No summaries. No framing. The things that changed, in the order they changed.
          </p>
        </div>
      </section>

      {/* ── Entries ──────────────────────────────────────────────── */}
      {ENTRIES.map((entry, i) => (
        <section
          key={entry.date}
          style={{ paddingTop: i === 0 ? 120 : 96, paddingBottom: 0 }}
        >
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
                  marginBottom: 32,
                }}
              >
                {entry.date}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {entry.items.map((item) => (
                  <div key={item.line}>
                    <p
                      style={{
                        fontSize: 16,
                        color: "var(--ink)",
                        lineHeight: 1.5,
                        fontWeight: 500,
                        margin: 0,
                        marginBottom: item.sub ? 6 : 0,
                      }}
                    >
                      {item.line}
                    </p>
                    {item.sub && (
                      <p
                        style={{
                          fontSize: 14,
                          color: "var(--ink-soft)",
                          lineHeight: 1.6,
                          margin: 0,
                          fontFamily: "var(--font-mono-stack)",
                        }}
                      >
                        {item.sub}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
