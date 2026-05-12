const SIGNALS = [
  {
    label: "Needs attention",
    text: "Supplier arrival times are still unconfirmed and now affect the final-week walkthrough.",
  },
  {
    label: "Waiting on",
    text: "Final guest numbers are due before catering can close the menu plan.",
  },
  {
    label: "Still clear",
    text: "The ceremony room layout and venue deposit schedule are confirmed.",
  },
  {
    label: "Suggested focus",
    text: "Confirm arrivals, guest count, and the photo-list owner before Friday.",
  },
] as const;

export function WeddingSignalProof() {
  return (
    <section
      style={{
        maxWidth: 860,
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
          marginBottom: 16,
        }}
      >
        Wedding workspace proof
      </p>

      <div className="wedding-signal-layout">
        <div>
          <h2 className="h-title" style={{ marginBottom: 18 }}>
            Today&apos;s Signal for the same wedding workspace.
          </h2>
          <p
            style={{
              color: "var(--ink-soft)",
              fontSize: 16,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            The same venue meeting, tasks, and roadmap update become a short
            attention briefing. Not a dashboard. Just what needs focus before
            the plan drifts.
          </p>
        </div>

        <div
          style={{
            border: "1px solid var(--border-soft)",
            borderRadius: "var(--r-4)",
            background: "var(--bg-elev)",
            boxShadow: "var(--shadow-1)",
            padding: 28,
          }}
        >
          <p
            style={{
              margin: "0 0 22px",
              color: "var(--ink-quiet)",
              fontFamily: "var(--font-mono-stack)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Harbour House wedding - Today
          </p>

          <div style={{ display: "grid", gap: 18 }}>
            {SIGNALS.map((signal) => (
              <article
                key={signal.label}
                style={{
                  borderTop: "1px solid var(--border-soft)",
                  paddingTop: 16,
                }}
              >
                <p
                  style={{
                    margin: "0 0 6px",
                    color: "var(--ink)",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {signal.label}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "var(--ink-soft)",
                    fontSize: 14,
                    lineHeight: 1.55,
                  }}
                >
                  {signal.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
