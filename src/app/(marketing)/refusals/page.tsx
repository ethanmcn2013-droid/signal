import type { Metadata } from "next";
import Link from "next/link";

/**
 * /refusals, Einstein row 9. The page that tells you what we will
 * never ship. Each line is a sentence the product team can point at
 * when the request comes up. Sourced from docs/PRODUCT.md §7.
 *
 * Editorial register: no charts, no chrome, type only. The same
 * spareness as /law and /method. A refusal is a promise.
 */

export const metadata: Metadata = {
  title: "Refusals, Signal",
  description:
    "What Signal will never ship. Seven sentences. Each is a decision we point at when the request comes up.",
};

const REFUSALS = [
  {
    head: "Not a dashboard.",
    body: "No metric tiles. No graphs. No counters. No “score.” A briefing is sentences.",
  },
  {
    head: "Not productivity tracking.",
    body: "No per-person scores. No leaderboards. No completion-rate rankings. Counting people does not make work move.",
  },
  {
    head: "Not configurable.",
    body: "No rule editor. No threshold sliders. No widget composer. If the product needs a settings page beyond account, billing, and integrations, the product is wrong.",
  },
  {
    head: "Not a notification stream.",
    body: "Briefings fire on a fixed cadence. The product does not interrupt during the day. It does not push. It does not ping.",
  },
  {
    head: "Not enterprise software.",
    body: "No roles, permissions, audit logs, or SSO at v1. Deferred to demand, not promised in advance.",
  },
  {
    head: "Not AI-marketed.",
    body: "Even if a future cycle introduces an LLM somewhere in the pipeline, the marketing surface never says “AI,” “intelligent,” “smart,” “agent,” or “copilot.” The voice rules govern.",
  },
  {
    head: "Not real-time.",
    body: "Daily Signal is daily. Weekly Signal is weekly. Launch Signal is on demand. If a user wants a live view, they want Tasks, not Signal.",
  },
] as const;

const PROSE_MAX = {
  maxWidth: 720,
  margin: "0 auto",
  paddingLeft: 24,
  paddingRight: 24,
};

export default function RefusalsPage() {
  return (
    <main style={{ background: "var(--bg)", paddingTop: 96, paddingBottom: 160 }}>
      <div style={PROSE_MAX}>
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            fontWeight: 600,
            color: "var(--ink-quiet)",
            fontFamily: "var(--font-mono-stack)",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Refusals
        </p>
        <h1
          className="text-balance"
          style={{
            fontSize: "clamp(2rem, 1.4rem + 2.4vw, 3rem)",
            fontWeight: 500,
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            color: "var(--ink)",
            margin: 0,
            marginBottom: 20,
            maxWidth: "20ch",
          }}
        >
          What we will never ship.
        </h1>
        <p
          style={{
            maxWidth: "58ch",
            fontSize: 16,
            lineHeight: 1.55,
            color: "var(--ink-soft)",
            marginBottom: 56,
          }}
        >
          Seven sentences. Each is a decision, not a future consideration —
          something we point at when the request comes up. A refusal is a
          promise. Read alongside{" "}
          <Link
            href="/method"
            style={{
              color: "var(--ink)",
              borderBottom: "1px solid var(--border)",
              textDecoration: "none",
            }}
          >
            Ten rules
          </Link>{" "}
          and{" "}
          <Link
            href="/law"
            style={{
              color: "var(--ink)",
              borderBottom: "1px solid var(--border)",
              textDecoration: "none",
            }}
          >
            the law
          </Link>
          .
        </p>

        <ol
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            borderTop: "1px solid var(--border-soft)",
          }}
        >
          {REFUSALS.map((r, i) => (
            <li
              key={r.head}
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr",
                gap: 16,
                padding: "28px 0",
                borderBottom: "1px solid var(--border-soft)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono-stack)",
                  fontSize: 10.5,
                  letterSpacing: "0.14em",
                  color: "var(--ink-faint)",
                  fontVariantNumeric: "tabular-nums",
                  paddingTop: 4,
                }}
              >
                {`0${i + 1}`.slice(-2)}
              </span>
              <div>
                <p
                  style={{
                    margin: 0,
                    marginBottom: 6,
                    fontSize: 19,
                    fontWeight: 600,
                    letterSpacing: "-0.018em",
                    color: "var(--ink)",
                  }}
                >
                  {r.head}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: "var(--ink-soft)",
                    textWrap: "pretty",
                  }}
                >
                  {r.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p
          style={{
            marginTop: 56,
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--ink-faint)",
            maxWidth: "56ch",
          }}
        >
          Sourced from <code>docs/PRODUCT.md §7</code>. When this page and the
          source disagree, the source wins, and we update this page in the
          same cycle.
        </p>
      </div>
    </main>
  );
}
