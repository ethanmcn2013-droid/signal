import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Signal Analytics",
};

export default function PricingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        background: "var(--bg)",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(1.875rem, 1.4rem + 2.2vw, 3.25rem)",
          fontWeight: 600,
          letterSpacing: "-0.035em",
          color: "var(--ink)",
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        Currently in private beta.
      </h1>
      <p
        style={{
          fontSize: 17,
          color: "var(--ink-soft)",
          lineHeight: 1.55,
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        Request access at{" "}
        <a
          href="mailto:hello@signalstudio.ie"
          style={{ color: "var(--ink)", textDecoration: "underline" }}
        >
          hello@signalstudio.ie
        </a>
      </p>
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
    </main>
  );
}
