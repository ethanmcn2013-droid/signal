"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";

/**
 * App-segment error boundary, shown inside the authenticated shell
 * when /app/* routes throw. Wordmark link goes to /app/brief.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Forward client-side render errors to Sentry — instrumentation's
    // onRequestError covers server errors only. No-op when unconfigured.
    Sentry.captureException(error);
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "0 24px",
        minHeight: 400,
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
          fontSize: "clamp(22px, 3vw, 30px)",
          fontWeight: 600,
          letterSpacing: "-0.03em",
          color: "var(--ink)",
          textAlign: "center",
          margin: 0,
        }}
      >
        Could not load the briefing.
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--ink-soft)",
          textAlign: "center",
          lineHeight: 1.55,
          maxWidth: 340,
          margin: 0,
        }}
      >
        A temporary problem occurred. Your data is fine, try refreshing.
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          type="button"
          onClick={reset}
          style={{
            fontSize: 13,
            color: "var(--bg)",
            background: "var(--ink)",
            fontWeight: 500,
            border: "1px solid var(--ink)",
            borderRadius: 999,
            padding: "7px 16px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <Link
          href="/app/brief"
          style={{
            fontSize: 13,
            color: "var(--ink)",
            fontWeight: 500,
            textDecoration: "underline",
            textUnderlineOffset: 3,
            display: "flex",
            alignItems: "center",
          }}
        >
          Open the briefing
        </Link>
      </div>
    </div>
  );
}
