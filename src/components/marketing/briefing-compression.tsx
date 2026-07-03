/**
 * Briefing compression, Einstein row 4. The mechanism made visible.
 *
 * The mechanism-in-one-line section says the engine *picks* language,
 * it doesn't generate it. This diagram shows what picking means:
 * many triggers fire, a ranker compresses, three items survive.
 *
 * Server-rendered SVG. No JS. The lines fan in on the page; the
 * reader gets it in one glance. Reduced-motion users see the same
 * diagram at rest. No animation, no client cost.
 */

const TRIGGER_LABELS = [
  "Due tomorrow",
  "Overdue 2d",
  "Blocked 4d",
  "Stalled",
  "Crowded week",
  "Cap reached",
  "Decision idle",
  "Risk aging",
  "Win shipped",
  "Quiet inbox",
] as const;

const SURFACED = [
  "Website launch is blocked by missing assets",
  "Four overdue tasks affecting campaign timing",
  "Too much in flight for the next two days",
] as const;

export function BriefingCompression() {
  // SVG viewBox is 1080 wide × 360 tall, scales by CSS.
  // Three columns: triggers (10 rows), ranker (centre), surfaced (3 rows).
  const triggerX = 120;
  const rankerX = 540;
  const surfacedX = 960;
  const triggerYTop = 40;
  const triggerYStep = 28;
  const surfacedYTop = 100;
  const surfacedYStep = 80;

  return (
    <section
      className="reveal px-6"
      style={{ paddingTop: 96, paddingBottom: 96 }}
      aria-label="The engine compresses ten triggers into three signals"
    >
      <div className="mx-auto w-full max-w-[1140px]">
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            fontWeight: 600,
            color: "var(--ink-quiet)",
            fontFamily: "var(--font-mono-stack)",
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          What picking looks like
        </p>
        <h3
          className="text-balance"
          style={{
            maxWidth: "26ch",
            fontSize: "clamp(1.4rem, 0.9rem + 1.8vw, 2rem)",
            fontWeight: 500,
            letterSpacing: "-0.022em",
            lineHeight: 1.18,
            color: "var(--ink)",
            margin: 0,
            marginBottom: 32,
          }}
        >
          Ten triggers fire in a day.{" "}
          <span style={{ color: "color-mix(in srgb, var(--ink) 55%, transparent)" }}>
            Three earn the read.
          </span>
        </h3>

        <div
          style={{
            borderRadius: 16,
            border: "1px solid var(--border-soft)",
            background:
              "linear-gradient(180deg, var(--bg-elev) 0%, color-mix(in srgb, var(--bg-deep) 60%, var(--bg-elev)) 100%)",
            padding: "28px 24px",
          }}
        >
          <svg
            viewBox="0 0 1080 360"
            width="100%"
            height="auto"
            role="img"
            aria-label="Diagram: ten triggers feed into a ranker, three items surface"
            style={{ display: "block" }}
          >
            {/* Column eyebrows */}
            <text
              x={triggerX}
              y={20}
              fontSize={10.5}
              fontFamily="var(--font-mono-stack)"
              letterSpacing={1.4}
              fill="var(--ink-faint)"
              textAnchor="middle"
            >
              10 TRIGGERS
            </text>
            <text
              x={rankerX}
              y={20}
              fontSize={10.5}
              fontFamily="var(--font-mono-stack)"
              letterSpacing={1.4}
              fill="var(--ink-faint)"
              textAnchor="middle"
            >
              RANKER
            </text>
            <text
              x={surfacedX}
              y={20}
              fontSize={10.5}
              fontFamily="var(--font-mono-stack)"
              letterSpacing={1.4}
              fill="var(--ink-faint)"
              textAnchor="middle"
            >
              3 SURFACED
            </text>

            {/* Fan-in lines: every trigger connects to the ranker.
                The three that survive get a stronger stroke. */}
            {TRIGGER_LABELS.map((_, i) => {
              const y = triggerYTop + i * triggerYStep;
              const survives = i === 0 || i === 1 || i === 4;
              return (
                <line
                  key={`fan-in-${i}`}
                  x1={triggerX + 90}
                  y1={y}
                  x2={rankerX - 60}
                  y2={180}
                  stroke={
                    survives ? "rgba(79,70,229,0.55)" : "rgba(20,21,26,0.10)"
                  }
                  strokeWidth={survives ? 1.4 : 1}
                />
              );
            })}

            {/* Trigger rows */}
            {TRIGGER_LABELS.map((label, i) => {
              const y = triggerYTop + i * triggerYStep;
              const survives = i === 0 || i === 1 || i === 4;
              return (
                <g key={`trigger-${i}`}>
                  <circle
                    cx={triggerX - 80}
                    cy={y}
                    r={3}
                    fill={
                      survives ? "var(--color-signal, #4f46e5)" : "var(--border)"
                    }
                  />
                  <text
                    x={triggerX - 68}
                    y={y + 4}
                    fontSize={12}
                    fill={survives ? "var(--ink)" : "var(--ink-soft)"}
                    fontWeight={survives ? 500 : 400}
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Ranker pill */}
            <rect
              x={rankerX - 60}
              y={150}
              width={120}
              height={60}
              rx={30}
              ry={30}
              fill="var(--bg)"
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text
              x={rankerX}
              y={178}
              fontSize={11}
              fontFamily="var(--font-mono-stack)"
              letterSpacing={1.2}
              fill="var(--ink-quiet)"
              textAnchor="middle"
            >
              RANK
            </text>
            <text
              x={rankerX}
              y={196}
              fontSize={10.5}
              fontFamily="var(--font-mono-stack)"
              letterSpacing={1.0}
              fill="var(--ink-faint)"
              textAnchor="middle"
            >
              · CAP 3 ·
            </text>

            {/* Fan-out lines: three to the surfaced items */}
            {SURFACED.map((_, i) => {
              const y = surfacedYTop + i * surfacedYStep;
              return (
                <line
                  key={`fan-out-${i}`}
                  x1={rankerX + 60}
                  y1={180}
                  x2={surfacedX - 12}
                  y2={y}
                  stroke="rgba(79,70,229,0.55)"
                  strokeWidth={1.4}
                />
              );
            })}

            {/* Surfaced items */}
            {SURFACED.map((line, i) => {
              const y = surfacedYTop + i * surfacedYStep;
              return (
                <g key={`surfaced-${i}`}>
                  <rect
                    x={surfacedX - 4}
                    y={y - 22}
                    width={4}
                    height={44}
                    rx={2}
                    fill="var(--color-signal, #4f46e5)"
                  />
                  <text
                    x={surfacedX + 12}
                    y={y - 6}
                    fontSize={10.5}
                    fontFamily="var(--font-mono-stack)"
                    letterSpacing={1.2}
                    fill="var(--color-signal, #4f46e5)"
                  >
                    {`0${i + 1}`}
                  </text>
                  <text
                    x={surfacedX + 12}
                    y={y + 12}
                    fontSize={12.5}
                    fill="var(--ink)"
                    fontWeight={500}
                  >
                    {line}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <p
          style={{
            marginTop: 20,
            maxWidth: "58ch",
            fontSize: 13,
            lineHeight: 1.55,
            color: "var(--ink-faint)",
          }}
        >
          The ranker compares signal against weight, recency, and the
          three-per-block cap. Nothing is invented; some triggers are
          held until they earn the read.
        </p>
      </div>
    </section>
  );
}
