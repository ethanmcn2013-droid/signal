import type { Metadata } from "next";
import Link from "next/link";

/**
 * /law, Einstein's equation, one page, one diagram.
 *
 * Row 12 of the walkover (locked 2026-06-07). Work-items axis (count)
 * vs attention-cost axis (consequence × proximity × cascade) with the
 * briefing-cut line drawn through. Three dots above the line, the rest
 * greyed. Static SVG. No interactivity. Tufte's Visual Display p. 13
 * energy, small, dense, honest.
 *
 * The equation: Signal = top₃( rank( triggers(work) ) ) , where rank ⊥ model.
 */

export const metadata: Metadata = {
  title: "The Law, Signal",
  description:
    "One page. One diagram. The shape of attention, and where the briefing draws the line.",
};

const PROSE_MAX = {
  maxWidth: 720,
  margin: "0 auto",
  paddingLeft: 24,
  paddingRight: 24,
};

// Twelve work items plotted on the (work-count, attention-cost) plane.
// Three above the cut line, the briefing keeps these. Nine below, greyed.
// Coordinates are tuned to read as natural scatter, not as a curve.
type Dot = { x: number; y: number; label?: string; keep: boolean };
const DOTS: Dot[] = [
  // Above the cut, kept
  { x: 0.20, y: 0.86, label: "blocked", keep: true },
  { x: 0.55, y: 0.78, label: "overdue", keep: true },
  { x: 0.78, y: 0.92, label: "dependency-stall", keep: true },
  // Below the cut, dropped silently
  { x: 0.08, y: 0.52, keep: false },
  { x: 0.18, y: 0.38, keep: false },
  { x: 0.30, y: 0.46, keep: false },
  { x: 0.36, y: 0.22, keep: false },
  { x: 0.48, y: 0.34, keep: false },
  { x: 0.58, y: 0.18, keep: false },
  { x: 0.66, y: 0.50, keep: false },
  { x: 0.80, y: 0.30, keep: false },
  { x: 0.92, y: 0.42, keep: false },
];

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

export default function LawPage() {
  // SVG plotting space, Tufte-density, no gridlines, no tick marks.
  const W = 720;
  const H = 420;
  const PAD_L = 80;
  const PAD_R = 24;
  const PAD_T = 28;
  const PAD_B = 56;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const px = (x: number) => PAD_L + x * plotW;
  const py = (y: number) => PAD_T + (1 - y) * plotH;

  // The briefing-cut: items above this line make it in. Drawn as a single
  // thin diagonal, the cut isn't horizontal because attention-cost
  // tolerance scales with how many items are in flight.
  const cutAtX0 = 0.64; // y-intercept on left
  const cutAtX1 = 0.68; // y-intercept on right

  return (
    <div style={{ background: "var(--bg)", paddingBottom: 120 }}>
      <section style={{ paddingTop: 96, paddingBottom: 56 }}>
        <div style={PROSE_MAX}>
          <Eyebrow>The law</Eyebrow>
          <h1 className="h-display" style={{ marginBottom: 22 }}>
            One page. One diagram.
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              color: "var(--ink-soft)",
              marginBottom: 14,
            }}
          >
            Every morning the work has a shape. Most items don&apos;t need you
            today. A few do. The briefing draws the cut and surfaces what
            sits above it.
          </p>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--ink-quiet)",
            }}
          >
            Twelve open items. The briefing keeps three. The rest are dropped,
            silently.
          </p>
        </div>
      </section>

      {/* ── The diagram ───────────────────────────────────────────── */}
      <section style={{ paddingTop: 8, paddingBottom: 56 }}>
        <div
          style={{
            maxWidth: 880,
            margin: "0 auto",
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            role="img"
            aria-label="Twelve work items plotted by count and attention-cost. Three above the briefing-cut line are kept; nine below are dropped."
            style={{
              display: "block",
              height: "auto",
              background: "transparent",
              fontFamily: "var(--font-mono-stack)",
            }}
          >
            {/* Axes, thin, low-ink */}
            <line
              x1={PAD_L}
              y1={H - PAD_B}
              x2={W - PAD_R}
              y2={H - PAD_B}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <line
              x1={PAD_L}
              y1={PAD_T}
              x2={PAD_L}
              y2={H - PAD_B}
              stroke="var(--border)"
              strokeWidth={1}
            />

            {/* Axis labels */}
            <text
              x={PAD_L}
              y={H - 18}
              fontSize={11}
              fill="var(--ink-quiet)"
              letterSpacing="0.12em"
              style={{ textTransform: "uppercase" }}
            >
              work items (count)
            </text>
            <text
              x={PAD_L - 12}
              y={PAD_T + 2}
              fontSize={11}
              fill="var(--ink-quiet)"
              letterSpacing="0.12em"
              textAnchor="end"
              style={{ textTransform: "uppercase" }}
            >
              attention-cost
            </text>
            <text
              x={PAD_L - 12}
              y={PAD_T + 18}
              fontSize={10}
              fill="var(--ink-faint)"
              letterSpacing="0.04em"
              textAnchor="end"
            >
              consequence × proximity × cascade
            </text>

            {/* The briefing-cut line */}
            <line
              x1={px(0)}
              y1={py(cutAtX0)}
              x2={px(1)}
              y2={py(cutAtX1)}
              stroke="var(--ink)"
              strokeWidth={1.25}
              strokeDasharray="2 4"
            />
            <text
              x={px(1) - 6}
              y={py(cutAtX1) - 8}
              fontSize={10.5}
              fill="var(--ink)"
              textAnchor="end"
              letterSpacing="0.06em"
              style={{ fontWeight: 600 }}
            >
              briefing cut
            </text>

            {/* Dropped dots, greyed */}
            {DOTS.filter((d) => !d.keep).map((d, i) => (
              <circle
                key={`drop-${i}`}
                cx={px(d.x)}
                cy={py(d.y)}
                r={3}
                fill="var(--ink-faint)"
                opacity={0.55}
              />
            ))}

            {/* Kept dots, ink, with labels */}
            {DOTS.filter((d) => d.keep).map((d, i) => (
              <g key={`keep-${i}`}>
                <circle
                  cx={px(d.x)}
                  cy={py(d.y)}
                  r={4.5}
                  fill="var(--ink)"
                />
                {d.label ? (
                  <text
                    x={px(d.x) + 9}
                    y={py(d.y) + 4}
                    fontSize={10.5}
                    fill="var(--ink-soft)"
                    letterSpacing="0.02em"
                  >
                    {d.label}
                  </text>
                ) : null}
              </g>
            ))}
          </svg>

          <p
            style={{
              marginTop: 18,
              fontSize: 12,
              color: "var(--ink-faint)",
              fontFamily: "var(--font-mono-stack)",
              letterSpacing: "0.06em",
              textAlign: "center",
            }}
          >
            12 open items · 3 above the cut · 9 dropped silently
          </p>
        </div>
      </section>

      {/* ── The equation ──────────────────────────────────────────── */}
      <section style={{ paddingTop: 56, paddingBottom: 0 }}>
        <div style={PROSE_MAX}>
          <Eyebrow>The equation</Eyebrow>
          <p
            className="font-mono"
            style={{
              fontSize: "clamp(15px, 1.6vw, 19px)",
              color: "var(--ink)",
              letterSpacing: "0.01em",
              lineHeight: 1.6,
              padding: "20px 24px",
              border: "1px solid var(--border-soft)",
              borderRadius: "var(--r-3)",
              background: "var(--bg-elev)",
              margin: 0,
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
            aria-label="Signal equals top three of rank of triggers of work, where rank is orthogonal to model"
          >
            Signal = top₃( rank( triggers(work) ) )
            <span style={{ color: "var(--ink-quiet)" }}>
              {"  ,  where rank ⊥ model"}
            </span>
          </p>
          <p
            style={{
              marginTop: 24,
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--ink-soft)",
            }}
          >
            <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
              triggers(work)
            </strong>{" "}
           , the ten rules read the work. Each rule has a name, a threshold,
            and a block it fires into.
          </p>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--ink-soft)",
              marginTop: 8,
            }}
          >
            <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
              rank(·)
            </strong>{" "}
           , cascade, then irreversibility, then proximity. A deterministic
            order, not a learned one.
          </p>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--ink-soft)",
              marginTop: 8,
            }}
          >
            <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
              top₃(·)
            </strong>{" "}
           , the hard cap. Three items per block. The rest are dropped
            silently, the briefing never lists &ldquo;and 14 more&rdquo;.
          </p>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--ink-soft)",
              marginTop: 8,
            }}
          >
            <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
              rank ⊥ model
            </strong>{" "}
           , the ranking is independent of any model. There isn&apos;t one
            in the path.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 96 }}>
        <div style={PROSE_MAX}>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link
              href="/method"
              style={{
                fontSize: 15,
                color: "var(--ink)",
                textDecoration: "underline",
                textDecorationColor: "var(--border-soft)",
                textUnderlineOffset: 4,
              }}
            >
              The ten rules
            </Link>
            <span style={{ color: "var(--ink-quiet)" }}>·</span>
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
          </div>
        </div>
      </section>
    </div>
  );
}
