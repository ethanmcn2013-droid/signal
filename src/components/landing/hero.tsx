"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { AudienceToggle } from "./audience-toggle";
import { AnalyticsDemo } from "./analytics-demo";
import { type DomainId } from "@/lib/domains";

/**
 * Analytics homepage hero — modelled on Tasks's hero pattern.
 * Eyebrow + H1 + body + CTAs + status pip + audience toggle, with the
 * briefing demo as a full-width artifact below.
 */
export function Hero() {
  const [domain, setDomain] = useState<DomainId>("wedding");

  return (
    <section className="relative isolate overflow-hidden pt-8 md:pt-14">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-6">
        <p
          className="font-mono text-[11px] font-semibold uppercase"
          style={{
            color: "var(--ink-quiet)",
            letterSpacing: "0.14em",
          }}
        >
          Signal Analytics &middot; Attention clarity
        </p>

        <h1
          className="mt-5 max-w-[16ch] text-balance"
          style={{
            fontSize: "clamp(2.6rem, 1.8rem + 4.6vw, 5.5rem)",
            fontWeight: 600,
            lineHeight: 0.96,
            letterSpacing: "-0.045em",
            color: "var(--ink)",
          }}
        >
          A briefing, not a dashboard.
        </h1>

        <p
          className="mt-6 max-w-[54ch] text-[17px]"
          style={{
            color: "var(--ink-soft)",
            lineHeight: 1.55,
          }}
        >
          A short morning brief on the work that needs attention today.
          Three things per block, hard cap. The signal, not the noise.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/wedding-planning"
            className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium text-white shadow-[0_8px_24px_-8px_rgba(20,21,26,0.4)] transition-transform hover:-translate-y-px"
            style={{ background: "var(--ink)" }}
          >
            See a sample briefing
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
          </Link>
          <Link
            href="/signal"
            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-5 py-2.5 text-[14px] font-medium transition-colors"
            style={{
              borderColor: "var(--border)",
              color: "var(--ink-soft)",
            }}
          >
            What&apos;s in a briefing
          </Link>
        </div>

        <p
          className="mt-3 inline-flex items-center gap-2 text-[12.5px]"
          style={{
            color: "var(--ink-faint, var(--ink-quiet))",
          }}
        >
          <span
            className="block h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ background: "var(--status-shipped)" }}
          />
          Demo is live · choose an audience to reseed
        </p>

        {/* id="demo" anchors deep-links from the suite landing page. */}
        <div id="demo" className="mt-8 scroll-mt-20 md:mt-10">
          <AudienceToggle domain={domain} onChange={setDomain} />
        </div>

        <div className="mx-auto mt-6 max-w-[760px] md:mt-8">
          <AnimatePresence mode="wait" initial={false}>
            {/* --motion-moderate 320ms + --ease-out: audience swap */}
            <motion.div
              key={domain}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.32, ease: [0, 0, 0.2, 1] }}
            >
              <AnalyticsDemo domain={domain} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
