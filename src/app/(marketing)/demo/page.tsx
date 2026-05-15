import type { Metadata } from "next";
import Link from "next/link";

/**
 * /demo — full-bleed embed of the 30-second typography demo.
 *
 * Plan 7 · Cycle 7.2.
 *
 * The MP4 lives at /demo-typography.mp4 (Analytics public dir). Source
 * Remotion project at ~/Projects/personal/analytics-demo/.
 *
 * v1 (this cycle): typography only — no voice, no music. Cycle 7.3
 * lands the final cut once the music + voiceover decisions in
 * docs/demo-narrative.md §4–§5 are signed off.
 */

export const metadata: Metadata = {
  title: "The Demo — Signal Analytics",
  description:
    "Thirty seconds. The morning briefing, written in plain English. Everything important. Nothing distracting.",
};

const PROSE_MAX = { maxWidth: 720, marginInline: "auto", paddingInline: 24 };

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 11,
        letterSpacing: "0.14em",
        fontWeight: 600,
        color: "var(--ink-quiet)",
        fontFamily: "var(--font-mono-stack)",
        textTransform: "uppercase",
        margin: 0,
        marginBottom: 18,
      }}
    >
      {children}
    </p>
  );
}

export default function DemoPage() {
  return (
    <div style={{ background: "var(--bg)", paddingBottom: 120 }}>
      <section style={{ paddingTop: 96, paddingBottom: 56 }}>
        <div style={PROSE_MAX}>
          <Eyebrow>The demo</Eyebrow>
          <h1 className="h-display" style={{ marginBottom: 22 }}>
            Thirty seconds.
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "var(--ink-soft)",
              lineHeight: 1.6,
              maxWidth: 540,
              marginBottom: 4,
            }}
          >
            What arrives before your day starts. Plain sentences, four blocks,
            two minutes to read. Watch.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0, paddingBottom: 64 }}>
        <div
          style={{
            maxWidth: 1280,
            marginInline: "auto",
            paddingInline: 24,
          }}
        >
          <div
            style={{
              borderRadius: 12,
              overflow: "hidden",
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.04), 0 24px 64px rgba(0,0,0,0.10)",
              background: "#0a0a0a",
              aspectRatio: "16 / 9",
            }}
          >
            <video
              src="/demo-typography.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls
              poster=""
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
                background: "#0a0a0a",
              }}
            />
          </div>
          <p
            style={{
              marginTop: 14,
              fontSize: 12,
              color: "var(--ink-quiet)",
              fontFamily: "var(--font-mono-stack)",
              textAlign: "center",
              letterSpacing: "0.06em",
            }}
          >
            Typography only. Silence is the signal.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 32, paddingBottom: 0 }}>
        <div style={PROSE_MAX}>
          <div
            style={{
              borderTop: "1px solid var(--border-soft)",
              paddingTop: 40,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <p
              style={{
                fontSize: 16,
                color: "var(--ink-soft)",
                lineHeight: 1.65,
                margin: 0,
                maxWidth: 540,
              }}
            >
              Every sentence in the demo is one the engine actually fires.
              Drawn from a library written by hand — every line, a person wrote it.
            </p>
            <p
              style={{
                fontSize: 16,
                color: "var(--ink-soft)",
                lineHeight: 1.65,
                margin: 0,
                maxWidth: 540,
              }}
            >
              No dashboards, no charts, no metric tiles. Type carries the
              meaning.
            </p>
            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
              <Link
                href="/signal"
                style={{
                  fontSize: 15,
                  color: "var(--ink)",
                  textDecoration: "underline",
                  textDecorationColor: "var(--border-soft)",
                  textUnderlineOffset: 4,
                }}
              >
                What&apos;s in a briefing
              </Link>
              <span style={{ color: "var(--ink-quiet)" }}>·</span>
              <Link
                href="/method"
                style={{
                  fontSize: 15,
                  color: "var(--ink)",
                  textDecoration: "underline",
                  textDecorationColor: "var(--border-soft)",
                  textUnderlineOffset: 4,
                }}
              >
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
