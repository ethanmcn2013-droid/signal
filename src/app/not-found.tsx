import type { Metadata } from "next";
import Link from "next/link";

// Correct the tab title — a 404 otherwise inherits the marketing default
// ("Signal · Operational clarity…"), which reads as a real page.
export const metadata: Metadata = {
  title: "Page not found · Signal",
};

/**
 * Root 404, calm, on-brand. Wordmark inline so users can get back.
 * Renders its own <main> landmark (it sits outside the marketing/app
 * layouts, so nothing else provides one) and carries the skip target.
 */
export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: "0 24px",
      }}
    >
      <p
        style={{
          fontSize: 11,
          letterSpacing: "0.14em",
          fontWeight: 600,
          textTransform: "uppercase",
          color: "var(--ink-quiet)",
          fontFamily: "var(--font-mono-stack)",
        }}
      >
        404
      </p>
      <h1
        style={{
          fontSize: "clamp(28px, 5vw, 42px)",
          fontWeight: 600,
          letterSpacing: "-0.03em",
          color: "var(--ink)",
          textAlign: "center",
          margin: 0,
        }}
      >
        Page not found.
      </h1>
      <p
        style={{
          fontSize: 16,
          color: "var(--ink-soft)",
          textAlign: "center",
          lineHeight: 1.55,
          maxWidth: 380,
          margin: 0,
        }}
      >
        That page does not exist or has moved.
      </p>
      <Link
        href="/"
        style={{
          fontSize: 14,
          color: "var(--ink)",
          fontWeight: 500,
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
      >
        Back to Signal
      </Link>
    </main>
  );
}
