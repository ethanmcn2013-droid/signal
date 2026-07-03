import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "Wedding planning briefing, Signal",
  description:
    "What a daily briefing looks like for a wedding workspace, four weeks out. Plain sentences. What needs you, what's moving, what's quiet, what to do today.",
};

const BRIEFING = [
  {
    label: "Needs attention",
    dot: "#f59e0b",
    items: [
      "The Highfield deposit (€4,200) is due in 9 days, and Niamh has been waiting on confirmation.",
      "The final guest count was due 5 days ago.",
      "Lambs Hill visit hasn't been booked, and the venue decision is held up by it.",
    ],
  },
  {
    label: "Moving well",
    dot: "#10b981",
    items: [
      "Photography slots are booked, and the DJ shortlist is back from the couple.",
      "You closed 3 things this week.",
    ],
  },
  {
    label: "Quiet risks",
    dot: "#71717a",
    items: [
      "Niamh asked about the dietary list 4 days ago, no reply has gone back.",
      "Save-the-date design has had no activity in 11 days.",
      "Two trips to Highfield in two weeks, with no decision after either.",
    ],
  },
  {
    label: "Suggested focus",
    dot: "#4f46e5",
    items: [
      "Book the Lambs Hill visit today, it is blocking the venue decision.",
      "Send the final guest count to Niamh today, it was due 5 days ago.",
      "Pick a dietary template by tonight, the deadline is 4 June.",
    ],
  },
] as const;

const SECTION = { paddingTop: 96, paddingBottom: 0 };
const PROSE = { maxWidth: 640, margin: "0 auto", paddingLeft: 24, paddingRight: 24 };

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

export default function WeddingPlanningBriefingPage() {
  return (
    <>
    <div style={{ background: "var(--bg)", paddingBottom: 120 }}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section style={{ ...SECTION, paddingTop: 96 }}>
        <div style={PROSE}>
          <Eyebrow>Signal · Wedding planning briefing</Eyebrow>
          <h1 className="h-display" style={{ marginBottom: 24 }}>
            Today&apos;s briefing, for your wedding workspace.
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "var(--ink-soft)",
              lineHeight: 1.6,
              maxWidth: 560,
              marginBottom: 16,
            }}
          >
            Four weeks out. Three live suppliers. One date held but not confirmed.
            This is what a Sunday morning looks like in plain sentences, not a
            dashboard, not a feed, just what actually needs you today.
          </p>
          <p
            style={{
              fontSize: 13,
              fontFamily: "var(--font-mono-stack)",
              letterSpacing: "0.08em",
              color: "var(--ink-quiet)",
              textTransform: "uppercase",
              marginTop: 24,
            }}
          >
            Sunday · 4 weeks to go
          </p>
        </div>
      </section>

      {/* ── The briefing example ─────────────────────────────────── */}
      <section style={{ ...SECTION, paddingTop: 80 }}>
        <div style={PROSE}>
          <div
            style={{
              border: "1px solid var(--border-soft)",
              borderRadius: "var(--r-3)",
              padding: "40px 36px",
              background: "var(--bg-elev)",
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "var(--ink-soft)",
                lineHeight: 1.5,
                marginBottom: 36,
                fontStyle: "italic",
              }}
            >
              Good morning. Four weeks to go. Here&apos;s where the wedding stands.
            </p>

            {BRIEFING.map((block, blockIdx) => (
              <div
                key={block.label}
                style={{
                  marginBottom: blockIdx === BRIEFING.length - 1 ? 0 : 32,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
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
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono-stack)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      color: "var(--ink-quiet)",
                    }}
                  >
                    {block.label}
                  </span>
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {block.items.map((item, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontSize: 15.5,
                        color: "var(--ink)",
                        lineHeight: 1.6,
                        paddingLeft: 17,
                        position: "relative",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          color: "var(--ink-quiet)",
                        }}
                        aria-hidden
                      >
                        ·
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: 13,
              color: "var(--ink-quiet)",
              lineHeight: 1.5,
              marginTop: 18,
              fontStyle: "italic",
            }}
          >
            Two minutes to read. Read once. Move.
          </p>
        </div>
      </section>

      {/* ── What this is, what it isn't ──────────────────────────── */}
      <section style={{ ...SECTION, paddingTop: 96 }}>
        <div style={PROSE}>
          <Eyebrow>The point</Eyebrow>
          <h2 className="h-title" style={{ marginBottom: 24 }}>
            Wedding planning is run on attention, not throughput.
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--ink-soft)",
              lineHeight: 1.65,
              marginBottom: 16,
            }}
          >
            A spreadsheet can hold a hundred tasks. It can&apos;t tell you that
            the venue deposit deadline is the real bottleneck this week. The
            daily briefing is what does that, quietly, in the same words you
            would use.
          </p>
          <p
            style={{
              fontSize: 16,
              color: "var(--ink-soft)",
              lineHeight: 1.65,
              marginBottom: 16,
            }}
          >
            No charts. No completion percentages. No project-manager voice. Just
            the three things that need you today, the things that are quietly
            drifting, and the wins that are working themselves out.
          </p>
        </div>
      </section>

      {/* ── CTAs across the wedding loop ─────────────────────────── */}
      <section style={{ ...SECTION, paddingTop: 96 }}>
        <div style={PROSE}>
          <Eyebrow>See the rest of the loop</Eyebrow>
          <h2 className="h-title" style={{ marginBottom: 32 }}>
            The briefing is one layer. Here are the others.
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <a
              href="https://notes.signalstudio.ie/wedding-planning/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                gap: 16,
                padding: "20px 24px",
                border: "1px solid var(--border-soft)",
                borderRadius: "var(--r-3)",
                background: "var(--bg-elev)",
                textDecoration: "none",
                color: "var(--ink)",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono-stack)",
                  letterSpacing: "0.14em",
                  color: "var(--ink-quiet)",
                  textTransform: "uppercase",
                  minWidth: 64,
                  paddingTop: 4,
                }}
              >
                Notes
              </span>
              <span style={{ flex: 1 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--ink)",
                    marginBottom: 4,
                  }}
                >
                  Where the briefing&apos;s signals come from
                </span>
                <span style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.55 }}>
                  See how a venue meeting note becomes tasks, decisions, and a
                  shareable follow-up.
                </span>
              </span>
              <span style={{ color: "var(--ink-quiet)", fontSize: 14, alignSelf: "center" }}>↗</span>
            </a>

            <a
              href="https://tasks.signalstudio.ie/templates/wedding-planning-workspace"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                gap: 16,
                padding: "20px 24px",
                border: "1px solid var(--border-soft)",
                borderRadius: "var(--r-3)",
                background: "var(--bg-elev)",
                textDecoration: "none",
                color: "var(--ink)",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono-stack)",
                  letterSpacing: "0.14em",
                  color: "var(--ink-quiet)",
                  textTransform: "uppercase",
                  minWidth: 64,
                  paddingTop: 4,
                }}
              >
                Tasks
              </span>
              <span style={{ flex: 1 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--ink)",
                    marginBottom: 4,
                  }}
                >
                  Where the work actually lives
                </span>
                <span style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.55 }}>
                  The full wedding planning workspace template, twelve months of
                  real work, organised the way couples actually plan.
                </span>
              </span>
              <span style={{ color: "var(--ink-quiet)", fontSize: 14, alignSelf: "center" }}>↗</span>
            </a>

            <a
              href="https://timeline.signalstudio.ie/the-wedding"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                gap: 16,
                padding: "20px 24px",
                border: "1px solid var(--border-soft)",
                borderRadius: "var(--r-3)",
                background: "var(--bg-elev)",
                textDecoration: "none",
                color: "var(--ink)",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono-stack)",
                  letterSpacing: "0.14em",
                  color: "var(--ink-quiet)",
                  textTransform: "uppercase",
                  minWidth: 64,
                  paddingTop: 4,
                }}
              >
                Roadmap
              </span>
              <span style={{ flex: 1 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--ink)",
                    marginBottom: 4,
                  }}
                >
                  The shareable view for the couple, the venue, the suppliers
                </span>
                <span style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.55 }}>
                  One page that says what is happening now, what is held up, and
                  what is next, no app required.
                </span>
              </span>
              <span style={{ color: "var(--ink-quiet)", fontSize: 14, alignSelf: "center" }}>↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Sign-up CTA ───────────────────────────────────────────── */}
      <section style={{ ...SECTION, paddingTop: 96 }}>
        <div style={PROSE}>
          <div
            style={{
              borderTop: "1px solid var(--border-soft)",
              paddingTop: 48,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <p
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: "var(--ink)",
                lineHeight: 1.4,
              }}
            >
              Get this briefing every morning.
            </p>
            <p
              style={{
                fontSize: 15,
                color: "var(--ink-soft)",
                lineHeight: 1.6,
                maxWidth: 480,
              }}
            >
              Connect your Signal Tasks workspace and the briefing arrives in your
              inbox each morning, plain sentences, no charts, no noise.
            </p>
            {/* R10: verb "Open the briefing" per DESIGN.md §6 locked CTA vocab.
                Primary: indigo fill + pill radius per §6 primary button spec.
                Secondary: pill border so it reads as an action, not plain text. */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
              <Link
                href="/sign-in"
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  background: "var(--indigo)",
                  color: "#ffffff",
                  borderRadius: "var(--r-pill)",
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                }}
              >
                Open the briefing
              </Link>
              <a
                href="https://signalstudio.ie/venues/demo"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "10px 20px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-pill)",
                  fontSize: 14,
                  color: "var(--ink-soft)",
                  textDecoration: "none",
                }}
              >
                See the venue demo
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
    <SiteFooter />
    </>
  );
}
