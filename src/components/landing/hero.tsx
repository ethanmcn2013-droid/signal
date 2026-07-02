"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AudienceToggle } from "./audience-toggle";
import { AnalyticsDemo } from "./analytics-demo";
import { type DomainId } from "@/lib/domains";

/**
 * Analytics homepage live-demo section.
 * Eyebrow + H1 + body + status pip + audience toggle, with the briefing demo
 * as a full-width artifact below. Conversion lives in the closing CTA.
 */

// Einstein row 6 — prose rotation. Three angles on the same mechanism:
// rules-first, hand-written, no-model. The subhead cycles every 9s so a
// reader who lingers gets all three reads. Reduced-motion holds the
// first line and never rotates.
const PROSE_ROTATION = [
  "Ten rules read your work. A person wrote every sentence. No model in the path.",
  "Every line you read was written by a person. The engine picks, it does not write.",
  "Plain English by hand. Ten rules to decide what surfaces. Nothing generated, ever.",
] as const;

const PROSE_INTERVAL_MS = 9000;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function Hero() {
  const [domain, setDomain] = useState<DomainId>("wedding");
  const [proseIdx, setProseIdx] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(
      () => setProseIdx((i) => (i + 1) % PROSE_ROTATION.length),
      PROSE_INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  return (
    <section className="relative isolate overflow-hidden pt-2 md:pt-6">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-6">
        <p
          className="font-mono text-[11px] font-semibold uppercase"
          style={{
            color: "var(--ink-quiet)",
            letterSpacing: "0.14em",
          }}
        >
          Signal &middot; Attention clarity
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

        {/* Subheading — three clauses, one breath (row 14). Three
            angles rotate every 9s (row 6) so a reader who lingers gets
            all three reads. */}
        <div
          className="mt-6 max-w-[52ch]"
          style={{ minHeight: "5.2rem" }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={proseIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              className="text-[17px]"
              style={{ color: "var(--ink-soft)", lineHeight: 1.55, margin: 0 }}
            >
              {PROSE_ROTATION[proseIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Quiet eyebrow — three nouns, one negation (row 1). */}
        <p
          className="mt-5 font-mono text-[10.5px] font-semibold uppercase"
          style={{
            color: "var(--ink-quiet)",
            letterSpacing: "0.16em",
          }}
        >
          Ten rules. No model. Written by hand.
        </p>

        <p
          className="mt-7 max-w-[54ch] text-[15.5px]"
          style={{
            color: "var(--ink-soft)",
            lineHeight: 1.55,
          }}
        >
          A short morning brief on the work that needs attention today.
          Three things per block, hard cap. The signal, not the noise.
        </p>

        <p
          className="mt-7 inline-flex items-center gap-2 text-[12.5px]"
          style={{
            color: "var(--ink-faint, var(--ink-quiet))",
          }}
        >
          <span
            className="block h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ background: "var(--status-shipped)" }}
          />
          Demo is live · pick a scenario
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
