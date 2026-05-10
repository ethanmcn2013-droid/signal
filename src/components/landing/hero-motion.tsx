"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

export function HeroMotion() {
  const reduced = useReducedMotion();

  return (
    <section
      style={{
        paddingTop: 120,
        paddingBottom: 96,
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={reduced ? undefined : { opacity: 1, y: 0 }}
        transition={
          reduced
            ? undefined
            : { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }
        }
        style={{
          maxWidth: 860,
          margin: "0 auto",
        }}
      >
        <p
          style={{
            marginBottom: 18,
            fontSize: 11,
            fontFamily: "var(--font-mono-stack)",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink-quiet)",
          }}
        >
          Signal Analytics · Attention clarity
        </p>

        <h1 className="h-display" style={{ maxWidth: "11ch", marginBottom: 24 }}>
          Cut through the noise.
        </h1>

        <p
          style={{
            maxWidth: 560,
            margin: 0,
            fontSize: 18,
            lineHeight: 1.55,
            color: "var(--ink-soft)",
          }}
        >
          A short briefing for the work that needs attention today.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 34,
          }}
        >
          <Link
            href="#briefing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 42,
              padding: "0 18px",
              borderRadius: "var(--r-2)",
              background: "var(--brand)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Open the briefing
          </Link>
          <Link
            href="/signal"
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 42,
              padding: "0 18px",
              borderRadius: "var(--r-2)",
              border: "1px solid var(--border)",
              color: "var(--ink)",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            See the signal
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
