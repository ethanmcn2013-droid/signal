import type { Metadata } from "next";
import { TASKS_URL, ROADMAP_URL } from "@/lib/product-urls";

export const metadata: Metadata = {
  title: "About — Signal Analytics",
  description:
    "A briefing, not a dashboard. What Signal Analytics is, why it exists, and where it sits in the Signal Studio suite.",
};

const PROSE_MAX = { maxWidth: 640, margin: "0 auto", paddingLeft: 24, paddingRight: 24 };

export default function AboutPage() {
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
            About
          </p>

          <h1 className="h-title" style={{ marginBottom: 16 }}>
            A briefing, not a dashboard.
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "var(--ink-quiet)",
              lineHeight: 1.5,
              maxWidth: 520,
              marginBottom: 40,
            }}
          >
            Operational clarity for people running it themselves.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              fontSize: 17,
              color: "var(--ink-soft)",
              lineHeight: 1.65,
              maxWidth: 580,
            }}
          >
            <p>
              Everyone has dashboards. No one reads them. Not because the data
              is wrong, but because the form is wrong. A dashboard is a library.
              You still have to decide which book to open, which page to turn to,
              which number to care about. That work — the interpretation — lands
              on the person who already has too much to do.
            </p>
            <p>
              You don&apos;t need more data. You need the briefing. A short,
              plain-English account of what is happening, what needs attention,
              and what to do next. The kind of brief a sharp colleague would
              write if they had read everything and knew what mattered.
            </p>
            <p>
              Signal Analytics is not a dashboard tool. It is a system that
              reads your work and writes the briefing. No configuration, no
              widgets, no report templates. You open it, and it has already done
              the reading.
            </p>
            <p>
              Signal Analytics is one of three products from Signal Studio.
              Signal Tasks handles execution — the list, the board, the daily
              flow. Signal Roadmap handles direction — where you are going and
              why. Signal Analytics handles attention. The one thing that
              determines whether any of it gets done.
            </p>
          </div>

          {/* ── From Signal Studio ───────────────────────────────── */}
          <div
            style={{
              marginTop: 72,
              borderTop: "1px solid var(--border-soft)",
              paddingTop: 48,
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
                marginBottom: 28,
              }}
            >
              From Signal Studio
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              <ProductCard
                name="Signal Tasks"
                description="Execution clarity. The live workspace for work that moves."
                href={TASKS_URL}
              />
              <ProductCard
                name="Signal Roadmap"
                description="Direction clarity. Your roadmap in plain English."
                href={ROADMAP_URL}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({
  name,
  description,
  href,
}: {
  name: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        border: "1px solid var(--border-soft)",
        borderRadius: "var(--r-3)",
        padding: "20px 24px",
        background: "var(--bg-elev)",
        textDecoration: "none",
        transition: "border-color 0.15s",
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
        {name}
      </p>
      <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.5, marginBottom: 12 }}>
        {description}
      </p>
      <span
        style={{
          fontSize: 12,
          color: "var(--ink-quiet)",
          fontFamily: "var(--font-mono-stack)",
        }}
      >
        Open ↗
      </span>
    </a>
  );
}
