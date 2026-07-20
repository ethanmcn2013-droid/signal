import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing, Signal",
  description:
    "Currently in private beta. Pricing lands when Signal is generally available.",
};

const PROSE_MAX = { maxWidth: 640, margin: "0 auto", paddingLeft: 24, paddingRight: 24 };

export default function PricingPage() {
  return (
    <div style={{ background: "var(--bg)", paddingBottom: 120 }}>
      <section style={{ paddingTop: 120, paddingBottom: 0 }}>
        <div style={PROSE_MAX}>
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
            Pricing
          </p>

          <h1 className="h-title" style={{ marginBottom: 24 }}>
            Currently in private beta.
          </h1>

          <p
            style={{
              fontSize: 17,
              color: "var(--ink-soft)",
              lineHeight: 1.6,
              maxWidth: 480,
              marginBottom: 48,
            }}
          >
            Pricing lands when Signal is generally available. Until
            then, request access below.
          </p>

          {/* Request access */}
          <div
            style={{
              borderTop: "1px solid var(--border-soft)",
              paddingTop: 40,
              marginBottom: 64,
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontFamily: "var(--font-mono-stack)",
                color: "var(--ink-quiet)",
                marginBottom: 12,
              }}
            >
              Request access
            </p>
            <a
              href="https://signalstudio.ie/waitlist?source=pricing&product=signal"
              style={{
                fontSize: 20,
                fontWeight: 500,
                color: "var(--ink)",
                textDecoration: "none",
                letterSpacing: "-0.01em",
              }}
            >
              hello@signalstudio.ie
            </a>
          </div>

          {/* Pricing philosophy */}
          <div
            style={{
              borderTop: "1px solid var(--border-soft)",
              paddingTop: 40,
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
                marginBottom: 24,
              }}
            >
              What we expect to charge
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.6, margin: 0 }}>
                No per-seat pricing. One person or ten, the price is the same.
              </p>
              <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.6, margin: 0 }}>
                No enterprise quotes. A number is a number. You will see it before
                you pay it.
              </p>
              <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.6, margin: 0 }}>
                No usage tiers nobody understands. One plan, one price, everything
                included.
              </p>
            </div>
            <p
              style={{
                marginTop: 28,
                fontSize: 12,
                fontFamily: "var(--font-mono-stack)",
                color: "var(--ink-quiet)",
                lineHeight: 1.5,
              }}
            >
              This is a statement of intent, not a commitment. Pricing will be
              confirmed at general availability.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
