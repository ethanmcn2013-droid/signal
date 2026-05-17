"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Root error boundary — client component per Next.js spec.
 * Calm, on-brand; offers a reset and a back link.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to observability without exposing raw error to the UI.
    console.error("[root-error]", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
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
        Something went wrong
      </p>
      <h1
        style={{
          fontSize: "clamp(24px, 4vw, 36px)",
          fontWeight: 600,
          letterSpacing: "-0.03em",
          color: "var(--ink)",
          textAlign: "center",
          margin: 0,
        }}
      >
        Could not load this page.
      </h1>
      <p
        style={{
          fontSize: 15,
          color: "var(--ink-soft)",
          textAlign: "center",
          lineHeight: 1.55,
          maxWidth: 380,
          margin: 0,
        }}
      >
        A temporary problem occurred. Your briefing data is fine.
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          type="button"
          onClick={reset}
          style={{
            fontSize: 14,
            color: "var(--bg)",
            background: "var(--ink)",
            fontWeight: 500,
            border: "1px solid var(--ink)",
            borderRadius: 999,
            padding: "8px 18px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            fontSize: 14,
            color: "var(--ink)",
            fontWeight: 500,
            textDecoration: "underline",
            textUnderlineOffset: 3,
            display: "flex",
            alignItems: "center",
          }}
        >
          Back to Signal Analytics
        </Link>
      </div>
    </div>
  );
}
