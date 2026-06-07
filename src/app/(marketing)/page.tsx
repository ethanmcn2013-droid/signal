import Link from "next/link";
import { AnalyticsHeroSignal } from "@/components/landing/analytics-hero-signal";
import { Hero } from "@/components/landing/hero";
import { BriefingAnatomy } from "@/components/marketing/briefing-anatomy";
import { SuiteArrows } from "@/components/suite-arrows";

const REQUEST_ACCESS_HREF =
  "mailto:hello@signalstudio.ie?subject=Analytics%20access";

/**
 * Analytics marketing homepage — structure:
 *   1. AnalyticsHeroSignal — "The Signal" scan-line hero (A·1, 2026-05-28)
 *   2. Hero                — product intro text + audience toggle + live briefing demo
 *   3. BriefingAnatomy     — anatomy of a briefing item
 *   4. CTA                 — access/sample close
 */
export default function HomePage() {
  return (
    <div style={{ background: "var(--bg)" }}>
      <SuiteArrows current="analytics" />
      <AnalyticsHeroSignal />
      <Hero />

      {/* Row 2 — engine never generates language, it picks language.
          Standalone interstitial between Hero and BriefingAnatomy. */}
      <section
        className="reveal px-6"
        style={{ paddingTop: 96, paddingBottom: 96 }}
        aria-label="The engine picks language"
      >
        <div className="mx-auto w-full max-w-[1140px]">
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              fontWeight: 600,
              color: "var(--ink-quiet)",
              fontFamily: "var(--font-mono-stack)",
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            The mechanism, in one line
          </p>
          <p
            className="text-balance"
            style={{
              maxWidth: "22ch",
              fontSize: "clamp(1.6rem, 1rem + 2.4vw, 2.6rem)",
              fontWeight: 500,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            The engine never generates language.{" "}
            <span style={{ color: "color-mix(in srgb, var(--ink) 55%, transparent)" }}>
              It picks language.
            </span>
          </p>
        </div>
      </section>

      <BriefingAnatomy />

      <section
        id="cta"
        className="reveal scroll-mt-24 px-6 pb-32 pt-12 md:pb-40 md:pt-20"
      >
        <div className="mx-auto w-full max-w-[1140px]">
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
            Start with the signal
          </p>
          <h2 className="h-title" style={{ maxWidth: "17ch" }}>
            Let the briefing do the sorting.
          </h2>
          <p
            style={{
              marginTop: 20,
              maxWidth: "56ch",
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--ink-soft)",
            }}
          >
            One short read for the work that needs attention now. Three items
            per block, hard cap, written in plain English.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={REQUEST_ACCESS_HREF}
              className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium text-white shadow-[0_8px_24px_-8px_rgba(20,21,26,0.4)] transition-transform hover:-translate-y-px"
              style={{ background: "var(--ink)" }}
            >
              Request access
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
            <Link
              href="/wedding-planning"
              className="inline-flex items-center gap-1.5 rounded-full border bg-white px-5 py-2.5 text-[14px] font-medium transition-colors"
              style={{
                borderColor: "var(--border)",
                color: "var(--ink-soft)",
              }}
            >
              Read a sample briefing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
