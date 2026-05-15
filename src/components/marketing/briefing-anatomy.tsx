/**
 * Anatomy of a briefing — Analytics' equivalent of Tasks' Anatomy
 * of a Card and Roadmap's Anatomy of a roadmap item.
 *
 * Six numbered annotations on the Daily Signal artifact. Same
 * structural pattern as the sibling products: demo on the left,
 * numbered ol on the right, eyebrow + section heading above.
 *
 * Builds the visual proof Analytics was missing — it had a strong
 * concept but no annotated product surface to anchor it.
 */

const ANN = [
  {
    label: "Timestamp",
    note: "When the briefing fires. Same time each morning. Always one short read, never a feed.",
  },
  {
    label: "Greeting",
    note: "Plain-English opener. The briefing speaks like a person, not a dashboard.",
  },
  {
    label: "Needs attention",
    note: "Shown when they matter: due and overdue dates, too much in flight, and a crowded week ahead.",
  },
  {
    label: "Moving well",
    note: "Quiet wins worth knowing. Calibrates against the noise of what's wrong.",
  },
  {
    label: "Quiet risks",
    note: "What's invisible but accumulating. Stalled work and blockers that have outlasted reasonable waiting.",
  },
  {
    label: "Suggested focus",
    note: "Three actions for today, compressed from the full picture. The signal, not the noise.",
  },
] as const;

export function BriefingAnatomy() {
  return (
    <section style={{ paddingTop: 120, paddingBottom: 120 }}>
      <div
        className="mx-auto w-full max-w-[1140px] px-6"
        style={{ display: "block" }}
      >
        {/* Eyebrow */}
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
          Anatomy of a briefing
        </p>

        {/* Title */}
        <h2 className="h-title" style={{ marginBottom: 20, maxWidth: "18ch" }}>
          Six things,{" "}
          <span style={{ color: "color-mix(in srgb, var(--ink) 50%, transparent)" }}>
            in one short read.
          </span>
        </h2>

        <p
          style={{
            maxWidth: "58ch",
            fontSize: 16,
            lineHeight: 1.55,
            color: "var(--ink-soft)",
            marginBottom: 56,
          }}
        >
          The Daily Signal carries six signals. Most are quiet — they only
          surface when the moment calls for them. The buckets stay; the
          contents change with the day.
        </p>

        {/* Demo + annotations grid */}
        <div
          style={{
            display: "grid",
            gap: 48,
            gridTemplateColumns: "1fr",
          }}
          className="lg:grid-cols-[1.1fr_1fr] lg:gap-20"
        >
          <DemoCard />
          <Annotations />
        </div>
      </div>
    </section>
  );
}

/* ── Demo briefing card (scaled-down, two-bucket excerpt) ──── */
function DemoCard() {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        borderRadius: 24,
        border: "1px solid var(--border-soft)",
        background:
          "linear-gradient(180deg, var(--bg-elev) 0%, color-mix(in srgb, var(--bg-deep) 60%, var(--bg-elev)) 100%)",
        padding: "56px 24px",
      }}
    >
      <div
        style={{
          width: 320,
          borderRadius: 14,
          border: "1px solid var(--border)",
          background: "#ffffff",
          padding: "20px 22px",
          boxShadow:
            "0 18px 44px -16px rgba(20,21,26,0.18), 0 0 0 1px rgba(20,21,26,0.04)",
        }}
      >
        {/* 1. Timestamp */}
        <p
          style={{
            fontSize: 10.5,
            letterSpacing: "0.14em",
            fontWeight: 600,
            color: "var(--ink-quiet)",
            fontFamily: "var(--font-mono-stack)",
            textTransform: "uppercase",
            margin: 0,
            marginBottom: 12,
          }}
        >
          Daily Signal · 09:14
        </p>

        {/* 2. Greeting */}
        <h3
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            margin: 0,
            marginBottom: 18,
          }}
        >
          Good morning.
        </h3>

        {/* 3. Needs attention */}
        <BucketHeading dotColor="var(--status-flight)" label="Needs attention" />
        <BucketItem>Website launch is blocked by missing assets</BucketItem>
        <BucketItem>4 overdue tasks affecting campaign timing</BucketItem>

        {/* 4. Moving well */}
        <div style={{ height: 14 }} />
        <BucketHeading dotColor="var(--status-shipped)" label="Moving well" />
        <BucketItem>Client onboarding completed faster than usual</BucketItem>
        <BucketItem>Product roadmap is ahead of schedule</BucketItem>

        {/* (5. Quiet risks + 6. Suggested focus omitted in this excerpt) */}
        <p
          style={{
            marginTop: 16,
            fontSize: 11,
            color: "var(--ink-faint)",
            fontFamily: "var(--font-mono-stack)",
            letterSpacing: "0.04em",
          }}
        >
          + 2 more buckets below
        </p>
      </div>
    </div>
  );
}

function BucketHeading({
  dotColor,
  label,
}: {
  dotColor: string;
  label: string;
}) {
  return (
    <p
      style={{
        fontSize: 10.5,
        letterSpacing: "0.14em",
        fontWeight: 600,
        color: "var(--ink-quiet)",
        fontFamily: "var(--font-mono-stack)",
        textTransform: "uppercase",
        margin: 0,
        marginBottom: 6,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          borderRadius: 999,
          background: dotColor,
        }}
      />
      {label}
    </p>
  );
}

function BucketItem({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 13.5,
        lineHeight: 1.5,
        color: "var(--ink-soft)",
        margin: 0,
        marginBottom: 4,
      }}
    >
      {children}
    </p>
  );
}

/* ── Annotations list ──────────────────────────────────────── */
function Annotations() {
  return (
    <ol
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {ANN.map((a, i) => (
        <li
          key={a.label}
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            alignItems: "start",
            gap: 12,
          }}
        >
          <span
            style={{
              marginTop: 2,
              display: "inline-flex",
              width: 24,
              height: 24,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              border: "1px solid var(--border-soft)",
              background: "#ffffff",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--ink-soft)",
            }}
          >
            {i + 1}
          </span>
          <div>
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 500,
                color: "var(--ink)",
              }}
            >
              {a.label}
            </div>
            <div
              style={{
                marginTop: 2,
                fontSize: 13,
                lineHeight: 1.55,
                color: "var(--ink-soft)",
              }}
            >
              {a.note}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
