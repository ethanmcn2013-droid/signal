import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Signal Analytics",
};

export default function AboutPage() {
  return (
    <main
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "120px 24px 96px",
        background: "var(--bg)",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(1.875rem, 1.4rem + 2.2vw, 3.25rem)",
          fontWeight: 600,
          letterSpacing: "-0.035em",
          color: "var(--ink)",
          lineHeight: 1.04,
          marginBottom: 40,
        }}
      >
        Operational clarity for people running it themselves.
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          fontSize: 17,
          color: "var(--ink-soft)",
          lineHeight: 1.65,
        }}
      >
        <p>
          Most work tools are built around recording work, not understanding it.
          They track every task, every comment, every status update — then leave
          you to figure out what matters. Signal Analytics does the opposite. It
          reads the state of your work and surfaces what deserves your attention
          today.
        </p>
        <p>
          It is not a dashboard. There are no charts to configure, no reports to
          schedule, no widgets to arrange. When you open it, you get a briefing.
          Plain sentences. What is blocked, what is moving, what is quietly at
          risk.
        </p>
        <p>
          Signal Analytics is a product of Signal Studio — a small studio
          building calm, focused tools for the way work actually happens.
        </p>
      </div>

      <div style={{ marginTop: 48 }}>
        <Link
          href="/"
          style={{
            fontSize: 14,
            color: "var(--ink-quiet)",
            textDecoration: "none",
          }}
        >
          ← Back
        </Link>
      </div>
    </main>
  );
}
