"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AudienceToggle } from "./audience-toggle";
import { AnalyticsDemo } from "./analytics-demo";
import { type DomainId } from "@/lib/domains";

/**
 * Analytics homepage live-demo section.
 *
 * Reworked 2026-07-03 (review 22): the brief was the opposite of a signal —
 * noisy, too long, not sharp. It now leads with one thing. The copy is a single
 * breath; the artifact opens on the one signal that needs you today and demotes
 * the rest to a quiet list. Conversion still lives in the closing CTA.
 */
export function Hero() {
  const [domain, setDomain] = useState<DomainId>("wedding");

  return (
    <section className="relative isolate overflow-hidden pt-2 md:pt-6">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-6">
        <p
          className="font-mono text-[11px] font-semibold uppercase"
          style={{ color: "var(--ink-quiet)", letterSpacing: "0.18em" }}
        >
          Signal &middot; Your work
        </p>

        <h2
          className="mt-5 max-w-[18ch] text-balance"
          style={{
            fontSize: "clamp(2.6rem, 1.8rem + 4.6vw, 5.5rem)",
            fontWeight: 600,
            lineHeight: 0.96,
            letterSpacing: "-0.045em",
            color: "var(--ink)",
          }}
        >
          Whatever you run, Signal reads it.
        </h2>

        {/* Escalation from the opener: that brief was a sample; this makes it
            the visitor's own. The audience toggle is the interactive proof. */}
        <p
          className="mt-6 max-w-[48ch] text-[17px]"
          style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}
        >
          That brief was a sample. Signal builds yours from your own tools. Pick
          a scenario and watch it change.
        </p>

        <p
          className="mt-5 font-mono text-[10.5px] font-semibold uppercase"
          style={{ color: "var(--ink-quiet)", letterSpacing: "0.18em" }}
        >
          Ten rules pick it. Written by hand. No model in the path.
        </p>

        <p
          className="mt-7 inline-flex items-center gap-2 font-mono text-[10.5px] uppercase"
          style={{
            color: "var(--ink-faint, var(--ink-quiet))",
            letterSpacing: "0.14em",
          }}
        >
          <span
            className="block h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ background: "var(--accent)" }}
          />
          Demo is live &middot; pick a scenario
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
