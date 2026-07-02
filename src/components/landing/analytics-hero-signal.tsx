"use client";

/**
 * Analytics hero — "The Signal" (A·1, 2026-05-28)
 *
 * Approach C: scan line sweeps the bar chart; the tall bar blooms on pass,
 * the caption resolves to "the signal, not the noise." Three scan cycles
 * then full loop reset.
 *
 * §13 safety contract
 * ─────────────────────────────────────────────────────────────────────
 * 1. All CSS is scoped under `.anl-` prefix — no globals bleed.
 * 2. All timers tracked in `timers[]`, cleared on unmount + loop reset.
 * 3. `rafId` cancelled on unmount + loop reset.
 * 4. `cancelled` flag gates every async branch + timer callback.
 * 5. `prefers-reduced-motion` skips to final bloomed state, no animation.
 * ─────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from "react";

// Signal wordmark plus bar-chart tick motif.
const LETTERS = "signal".split("");

export function AnalyticsHeroSignal() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // ── Element refs ───────────────────────────────────────────────────
    const composerEl   = root.querySelector<HTMLElement>(".anl-composer");
    const dotEl        = root.querySelector<HTMLElement>(".anl-dot");
    const barsRowEl    = root.querySelector<HTMLElement>(".anl-bars-row");
    const tallBarEl    = root.querySelector<HTMLElement>(".anl-bar.anl-tall");
    const captionEl    = root.querySelector<HTMLElement>(".anl-caption");
    const statusTREl   = root.querySelector<HTMLElement>(".anl-status-tr");
    const scanLineEl   = root.querySelector<HTMLElement>(".anl-scan-line");
    const bloomLabelEl = root.querySelector<HTMLElement>(".anl-bloom-label");
    const trail1El     = root.querySelector<HTMLElement>(".anl-trail-1");
    const trail2El     = root.querySelector<HTMLElement>(".anl-trail-2");
    const trail3El     = root.querySelector<HTMLElement>(".anl-trail-3");
    const rippleEl     = root.querySelector<HTMLElement>(".anl-intro-ripple");
    const rippleSlowEl = root.querySelector<HTMLElement>(".anl-intro-ripple-slow");

    if (
      !composerEl || !dotEl || !barsRowEl || !tallBarEl || !captionEl ||
      !statusTREl || !scanLineEl || !bloomLabelEl ||
      !trail1El || !trail2El || !trail3El || !rippleEl || !rippleSlowEl
    ) return;

    const letterEls = [...root.querySelectorAll<HTMLElement>(".anl-letter")];
    const barEls    = [...root.querySelectorAll<HTMLElement>(".anl-bar")];

    // ── Config ─────────────────────────────────────────────────────────
    const INTRO_MS           = 2600;
    const ENTRY_SETTLE_MS    = 3000;
    const SETTLE_BEFORE_SCAN = 600;
    const SCAN_DURATION_MS   = 1400;
    const SCAN_GAP_MS        = 160;
    const BLOOM_HOLD_MS      = 10000;
    const BLOOM_HOLD_REPEAT_MS = 7000;
    const UNBLOOM_MS         = 680;
    const INTER_SCAN_GAP_MS  = 1100;
    const MAX_SCAN_CYCLES    = 3;
    const CAP_FADE_MS        = 440;
    const LOOP_FADE_MS       = 640;
    const RISE_MS            = 280;
    const RISE_LEAD          = 80;

    const CAP_INIT   = "the bar appears";
    const CAP_SIGNAL = "the signal, not the noise.";

    const DOT_ANIM      = "anl-dot-roll var(--anl-intro-duration) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards"; // ds-allow: signal hero choreography
    const TRAIL_1_ANIM  = "anl-ghost-1 var(--anl-intro-duration) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards"; // ds-allow: signal hero choreography
    const TRAIL_2_ANIM  = "anl-ghost-2 var(--anl-intro-duration) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards"; // ds-allow: signal hero choreography
    const TRAIL_3_ANIM  = "anl-ghost-3 var(--anl-intro-duration) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards"; // ds-allow: signal hero choreography
    const RIPPLE_ANIM   = "anl-ripple-fast var(--anl-intro-duration) cubic-bezier(.22,.7,.2,1) 0s 1 forwards"; // ds-allow: signal hero choreography
    const RIPPLE_S_ANIM = "anl-ripple-slow var(--anl-intro-duration) cubic-bezier(.22,.7,.2,1) 0s 1 forwards"; // ds-allow: signal hero choreography
    const CAPTION_ANIM  = "anl-caption-in .7s cubic-bezier(.22,.7,.2,1) calc(var(--anl-intro-duration) + .1s) 1 forwards"; // ds-allow: signal hero choreography

    // ── Reduced motion: bloomed final state ────────────────────────────
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      letterEls.forEach(el => { el.style.opacity = "1"; el.style.transform = "translateY(0)"; });
      barEls.forEach(el => el.classList.add("anl-risen"));
      tallBarEl.style.opacity = "1";
      barEls.forEach(el => { if (el !== tallBarEl) el.style.opacity = "0.20"; });
      const rowRect = barsRowEl.getBoundingClientRect();
      const barRect = tallBarEl.getBoundingClientRect();
      const cx = barRect.left + barRect.width / 2 - rowRect.left;
      bloomLabelEl.style.left      = cx + "px";
      bloomLabelEl.style.top       = "0px";
      bloomLabelEl.style.transform = "translateX(-50%) translateY(-100%)";
      bloomLabelEl.style.opacity   = "1";
      captionEl.style.opacity    = "1";
      captionEl.style.animation  = "none";
      captionEl.textContent      = CAP_SIGNAL;
      return;
    }

    // ── Mutable loop state ─────────────────────────────────────────────
    let rafId     = 0;
    let rafStart  = 0;
    let cancelled = false;
    let timers    = [] as number[];
    let risenAt: (number | null)[] = [];
    let barRisen: boolean[]        = [];
    let letterCenters: number[]    = [];
    let barCenters: number[]       = [];
    let entryDone  = false;
    let scanCycles = 0;

    // ── Helpers ────────────────────────────────────────────────────────
    function wait(ms: number): Promise<void> {
      return new Promise(resolve => {
        if (cancelled) { resolve(); return; }
        const id = setTimeout(() => { if (!cancelled) resolve(); }, ms) as unknown as number;
        timers.push(id);
      });
    }

    function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
    }

    function barRestOpacity(el: HTMLElement): number {
      if (el.classList.contains("anl-tall"))   return 0.65;
      if (el.classList.contains("anl-medium")) return 0.50;
      return 0.38;
    }

    // ── Caption cross-fade ─────────────────────────────────────────────
    async function setCaption(text: string) {
      if (captionEl!.textContent === text) return;
      const half = CAP_FADE_MS / 2;
      captionEl!.style.transition = `opacity ${half}ms ease`;
      captionEl!.style.opacity    = "0";
      await wait(half);
      if (cancelled) return;
      captionEl!.textContent = text;
      captionEl!.style.opacity = "1";
      await wait(half);

      // near-ink pulse on "the signal" — authoritative, not UI-state
      if (text === CAP_SIGNAL) {
        await wait(80);
        if (cancelled) return;
        captionEl!.style.transition = "color 160ms ease";
        captionEl!.style.color      = "#4a4a4a";
        await wait(200);
        if (cancelled) return;
        captionEl!.style.transition = "color 560ms ease";
        captionEl!.style.color      = "";
        await wait(580);
        if (cancelled) return;
        captionEl!.style.transition = "";
      }
    }

    // ── Bloom ──────────────────────────────────────────────────────────
    function triggerBloom() {
      if (cancelled) return;

      // Spring height — bar snaps to attention
      tallBarEl!.style.transition = "opacity 280ms ease, height 300ms cubic-bezier(.34,1.4,.64,1)"; // ds-allow: signal hero choreography
      tallBarEl!.style.opacity    = "1";
      tallBarEl!.style.height     = "calc(.85em * 1.2)";

      // Dim floor to 0.20 — present, subordinate, not invisible
      barEls.forEach(el => {
        if (el === tallBarEl || !el.classList.contains("anl-risen")) return;
        el.style.transition = "opacity 320ms ease";
        el.style.opacity    = "0.20";
      });

      // Label rises into position (spatial entrance)
      const rowRect  = barsRowEl!.getBoundingClientRect();
      const barRect  = tallBarEl!.getBoundingClientRect();
      const centerX  = barRect.left + barRect.width / 2 - rowRect.left;

      bloomLabelEl!.style.transition = "none";
      bloomLabelEl!.style.left       = centerX + "px";
      bloomLabelEl!.style.top        = "0px";
      bloomLabelEl!.style.transform  = "translateX(-50%) translateY(-118%)";
      bloomLabelEl!.style.opacity    = "0";
      bloomLabelEl!.offsetHeight;    // flush
      bloomLabelEl!.style.transition = "opacity 320ms cubic-bezier(0,0,.2,1), transform 320ms cubic-bezier(0,0,.2,1)"; // ds-allow: signal hero choreography
      bloomLabelEl!.style.opacity    = "1";
      bloomLabelEl!.style.transform  = "translateX(-50%) translateY(-100%)";

      // TR chrome snaps to "the signal clears" on bloom
      statusTREl!.textContent = "the signal clears";
    }

    // ── Unbloom ────────────────────────────────────────────────────────
    async function unbloom() {
      // Label drifts up on exit
      bloomLabelEl!.style.transition = "opacity 200ms ease, transform 200ms ease";
      bloomLabelEl!.style.opacity    = "0";
      bloomLabelEl!.style.transform  = "translateX(-50%) translateY(-112%)";
      await wait(220);
      if (cancelled) return;

      // Tall bar springs back
      tallBarEl!.style.transition = `opacity ${UNBLOOM_MS}ms ease-out, height ${UNBLOOM_MS}ms cubic-bezier(.22,.7,.2,1)`; // ds-allow: signal hero choreography
      tallBarEl!.style.opacity    = "";
      tallBarEl!.style.height     = "";

      // Other bars ease-out back
      barEls.forEach(el => {
        if (el === tallBarEl || !el.classList.contains("anl-risen")) return;
        el.style.transition = `opacity ${UNBLOOM_MS}ms ease-out`;
        el.style.opacity    = "";
      });

      await wait(UNBLOOM_MS + 100);
    }

    // ── Scan line (rAF-driven) ─────────────────────────────────────────
    function animateScan(): Promise<void> {
      return new Promise(resolve => {
        if (cancelled) { resolve(); return; }

        const rowRect       = barsRowEl!.getBoundingClientRect();
        const scanWidth     = rowRect.width;
        const tallRect      = tallBarEl!.getBoundingClientRect();
        const bloomTriggerX = tallRect.left + tallRect.width / 2 - rowRect.left;

        // Per-bar center positions relative to bars-row (for individual flashes)
        const barFlashXs = barEls.map(el => {
          const r = el.getBoundingClientRect();
          return r.left + r.width / 2 - rowRect.left;
        });
        const barFlashed = new Array(barEls.length).fill(false) as boolean[];

        const scanStart = performance.now();
        let bloomFired  = false;

        // TR chrome → "scanning" during travel
        statusTREl!.textContent = "scanning";

        // Show scan line at left edge
        scanLineEl!.style.transition = "";
        scanLineEl!.style.transform  = "translateX(0px)";
        scanLineEl!.style.opacity    = "0.55";

        function scanFrame() {
          if (cancelled) { resolve(); return; }

          const t     = (performance.now() - scanStart) / SCAN_DURATION_MS;
          const clamp = Math.min(1, t);
          const eased = easeInOutCubic(clamp);
          const x     = eased * scanWidth;

          scanLineEl!.style.transform = `translateX(${x}px)`;

          // Flash each bar as scan crosses its center (not tall bar — that blooms)
          barEls.forEach((el, i) => {
            if (barFlashed[i] || el === tallBarEl) return;
            if (!el.classList.contains("anl-risen")) return;
            if (barFlashXs[i] !== undefined && x >= barFlashXs[i]) {
              barFlashed[i] = true;
              const rest = barRestOpacity(el);
              const peak = Math.min(0.9, rest + 0.20);
              el.style.transition = "opacity 40ms ease-out";
              el.style.opacity    = String(peak);
              const ft = setTimeout(() => {
                if (cancelled) return;
                el.style.transition = "opacity 240ms ease-out";
                el.style.opacity    = "";
              }, 55) as unknown as number;
              timers.push(ft);
            }
          });

          // Bloom when scan crosses tall bar center
          if (!bloomFired && x >= bloomTriggerX) {
            bloomFired = true;
            triggerBloom();
          }

          if (t < 1) {
            rafId = requestAnimationFrame(scanFrame);
          } else {
            // Overshoot exit — scan leaves with velocity
            const overshoot = scanWidth * 0.04;
            scanLineEl!.style.transition = "transform 100ms ease-in, opacity 260ms ease";
            scanLineEl!.style.transform  = `translateX(${scanWidth + overshoot}px)`;
            scanLineEl!.style.opacity    = "0";
            resolve();
          }
        }

        rafId = requestAnimationFrame(scanFrame);
      });
    }

    // ── Scan loop ──────────────────────────────────────────────────────
    async function scanLoop() {
      while (!cancelled) {
        await wait(SETTLE_BEFORE_SCAN);
        if (cancelled) return;

        await animateScan();
        if (cancelled) return;
        await wait(SCAN_GAP_MS);
        if (cancelled) return;

        // Caption: cross-fade only on first pass; stays "the signal" on repeats
        if (captionEl!.textContent !== CAP_SIGNAL) {
          await setCaption(CAP_SIGNAL);
        }
        if (cancelled) return;

        // First bloom = revelation (10s); repeats = reminder (7s)
        const holdMs = scanCycles === 0 ? BLOOM_HOLD_MS : BLOOM_HOLD_REPEAT_MS;
        await wait(holdMs);
        if (cancelled) return;

        await unbloom();
        if (cancelled) return;

        scanCycles++;

        if (scanCycles >= MAX_SCAN_CYCLES) {
          await loopFadeOut();
          if (!cancelled) init();
          return;
        }

        // No caption reset — "this is always happening, not starting over"
        await wait(INTER_SCAN_GAP_MS);
      }
    }

    // ── Second act (called after entry settles) ────────────────────────
    async function secondAct() {
      captionEl!.style.opacity   = "1";
      captionEl!.style.animation = "none";
      await scanLoop();
    }

    // ── Loop fade-out ──────────────────────────────────────────────────
    async function loopFadeOut() {
      captionEl!.style.transition = `opacity ${LOOP_FADE_MS}ms ease`;
      captionEl!.style.opacity    = "0";
      barEls.forEach(el => {
        el.style.transition = `opacity ${LOOP_FADE_MS}ms ease`;
        el.style.opacity    = "0";
      });
      letterEls.forEach(el => {
        el.style.transition = `opacity ${LOOP_FADE_MS * 0.8}ms ease`;
        el.style.opacity    = "0";
      });
      await wait(LOOP_FADE_MS + 120);
    }

    // ── Measure letter + bar centers ───────────────────────────────────
    function measure() {
      const cl = composerEl!.getBoundingClientRect().left;
      letterCenters = letterEls.map(el => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2 - cl;
      });
      barCenters = barEls.map(el => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2 - cl;
      });
    }

    // ── rAF entry frame ────────────────────────────────────────────────
    function frame() {
      const elapsed    = performance.now() - rafStart;
      const cl         = composerEl!.getBoundingClientRect().left;
      const dotRect    = dotEl!.getBoundingClientRect();
      const dotX       = dotRect.left + dotRect.width / 2 - cl;
      const dotOpacity = parseFloat(getComputedStyle(dotEl!).opacity);

      letterEls.forEach((el, i) => {
        const lx = letterCenters[i];
        if (lx === undefined) return;
        if (risenAt[i] === null && dotOpacity > 0.2 && lx - dotX < RISE_LEAD) {
          risenAt[i] = elapsed;
        }
        if (risenAt[i] === null) {
          el.style.opacity   = "0";
          el.style.transform = "translateY(115%)";
          return;
        }
        const p = easeOutCubic(Math.min(1, Math.max(0, (elapsed - risenAt[i]!) / RISE_MS)));
        el.style.opacity   = String(p);
        el.style.transform = `translateY(${(1 - p) * 115}%)`;
      });

      barEls.forEach((el, i) => {
        const bx = barCenters[i];
        if (bx === undefined || barRisen[i]) return;
        if (dotOpacity > 0.2 && dotX >= bx - 4) {
          el.classList.add("anl-risen");
          barRisen[i] = true;
        }
      });

      if (elapsed < ENTRY_SETTLE_MS) {
        rafId = requestAnimationFrame(frame);
      } else if (!entryDone) {
        entryDone = true;
        void secondAct();
      }
    }

    // ── Init ───────────────────────────────────────────────────────────
    function init() {
      cancelled = true;
      timers.forEach(clearTimeout);
      timers = [];
      cancelAnimationFrame(rafId);
      cancelled = false;

      risenAt    = new Array(letterEls.length).fill(null);
      barRisen   = new Array(barEls.length).fill(false);
      entryDone  = false;
      scanCycles = 0;

      // Reset letters
      letterEls.forEach(el => {
        el.style.transition = "none";
        el.style.opacity    = "0";
        el.style.transform  = "translateY(115%)";
      });

      // Reset bars (no-transition during reset to prevent flash)
      barEls.forEach(el => {
        el.style.transition = "none";
        el.classList.remove("anl-risen");
        el.style.opacity = "";
        el.style.height  = "";
        el.offsetHeight; // flush
        el.style.transition = "height 360ms cubic-bezier(.22,.7,.2,1), opacity 300ms ease"; // ds-allow: signal hero choreography
      });

      // Reset scan + label
      scanLineEl!.style.transition   = "";
      scanLineEl!.style.opacity      = "0";
      scanLineEl!.style.transform    = "translateX(0)";
      bloomLabelEl!.style.transition = "";
      bloomLabelEl!.style.opacity    = "0";
      bloomLabelEl!.style.transform  = "translateX(-50%) translateY(-100%)";

      // Reset caption
      captionEl!.style.transition = "";
      captionEl!.style.color      = "";
      captionEl!.textContent      = CAP_INIT;
      captionEl!.style.animation  = "none";
      captionEl!.style.opacity    = "";
      captionEl!.offsetHeight;    // flush
      captionEl!.style.animation  = CAPTION_ANIM;

      // Reset TR status
      statusTREl!.textContent = "the signal clears";

      // Restart CSS animations (none → reflow → restore)
      dotEl!.style.animation = "none";
      [trail1El, trail2El, trail3El, rippleEl, rippleSlowEl].forEach(el => {
        el!.style.animation = "none";
      });
      dotEl!.offsetHeight;
      dotEl!.style.animation         = DOT_ANIM;
      trail1El!.style.animation      = TRAIL_1_ANIM;
      trail2El!.style.animation      = TRAIL_2_ANIM;
      trail3El!.style.animation      = TRAIL_3_ANIM;
      rippleEl!.style.animation      = RIPPLE_ANIM;
      rippleSlowEl!.style.animation  = RIPPLE_S_ANIM;

      rafStart = performance.now();
      rafId = requestAnimationFrame(() => {
        measure();
        rafId = requestAnimationFrame(frame);
      });
    }

    // ── Resize ─────────────────────────────────────────────────────────
    function onResize() {
      if (!cancelled) {
        measure();
        if (bloomLabelEl!.style.opacity === "1") {
          const rowRect = barsRowEl!.getBoundingClientRect();
          const barRect = tallBarEl!.getBoundingClientRect();
          const cx = barRect.left + barRect.width / 2 - rowRect.left;
          bloomLabelEl!.style.left = cx + "px";
        }
      }
    }

    window.addEventListener("resize", onResize);
    init();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
    // INTRO_MS deliberately excluded — it's a constant that doesn't change between renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={rootRef as React.RefObject<HTMLElement>}
      className="anl-hero-section"
      aria-label="Signal"
    >
      <div className="anl-chrome anl-chrome-tl">
        <span className="anl-wm">
          <span>signal studio</span>
          <span className="anl-dot-static" />
          <span className="anl-sep">·</span>
          <span>signal</span>
        </span>
      </div>

      <div className="anl-chrome anl-chrome-tr" aria-hidden>
        <span className="anl-pip" aria-hidden />
        <span className="anl-status-tr">the signal clears</span>
      </div>

      <div className="anl-stage" aria-hidden>
        <div className="anl-composer-with-bars">
          <div className="anl-composer">
            <span className="anl-word">
              {LETTERS.map((letter, index) => (
                <span key={`${letter}-${index}`} className="anl-letter">
                  {letter}
                </span>
              ))}
            </span>
            <span className="anl-trail anl-trail-1" />
            <span className="anl-trail anl-trail-2" />
            <span className="anl-trail anl-trail-3" />
            <span className="anl-intro-ripple-slow" />
            <span className="anl-intro-ripple" />
            <span className="anl-dot" />
          </div>

          <div className="anl-bars-row">
            {/* row-reverse: DOM[0] = rightmost (tall bar) — directly below dot/period */}
            <span className="anl-bar anl-tall" />
            <span className="anl-bar anl-short" />
            <span className="anl-bar anl-medium" />
            <span className="anl-bar anl-short" />
            <span className="anl-bar anl-short" />
            <span className="anl-bar anl-medium" />
            <span className="anl-bar anl-short" />
            <div className="anl-scan-line" />
            <div className="anl-bloom-label">↑ now</div>
          </div>
        </div>

        <p className="anl-caption">the bar appears</p>
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.anl-hero-section {
  --anl-bg: var(--bg, #ffffff);
  --anl-ink: #111111;
  --anl-stone: #8c887e;
  --anl-indigo: #4f46e5;
  --anl-indigo-300: #a5b4fc;
  --anl-hairline: rgba(17,17,17,.06);
  --anl-wm-size: clamp(56px, 12vw, 168px);
  --anl-roll-distance: calc(var(--anl-wm-size) * 8);
  --anl-intro-duration: 2.6s;
  --anl-font: var(--font-geist-sans, 'Inter', system-ui, sans-serif);
  --anl-mono: var(--font-geist-mono, 'JetBrains Mono', 'Courier New', monospace);
  position: relative;
  overflow: hidden;
  min-height: min(88svh, 900px);
  background: var(--anl-bg);
  color: var(--anl-ink);
  font-family: var(--anl-font);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ── Corner chrome ──────────────────────────────────────────────── */
.anl-chrome {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--anl-stone);
  font-family: var(--anl-mono);
  font-size: 11px;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.anl-chrome-tl { top: 32px; left: 32px; }
.anl-chrome-tr { top: 32px; right: 32px; }
.anl-pip {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--anl-indigo);
  animation: anl-pip-blink 1.6s cubic-bezier(.45,.05,.55,.95) infinite; /* ds-allow: signal hero choreography */
}
@keyframes anl-pip-blink { 0%,100% { opacity: 1 } 50% { opacity: .35 } }

.anl-wm {
  display: inline-flex;
  align-items: baseline;
  color: var(--anl-ink);
  font-family: var(--anl-font);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -.025em;
  line-height: .95;
  text-transform: none;
}
.anl-dot-static {
  width: .16em; height: .16em;
  margin-bottom: .06em; margin-left: .06em;
  align-self: flex-end;
  border-radius: 50%;
  background: var(--anl-indigo);
  display: inline-block;
  flex: 0 0 auto;
}
.anl-sep {
  margin: 0 .4em;
  color: var(--anl-stone);
  font-weight: 300;
}

/* ── Stage ──────────────────────────────────────────────────────── */
.anl-stage {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 56px;
  padding: 88px 24px 72px;
}
.anl-composer-with-bars {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
}

/* ── Wordmark composer ──────────────────────────────────────────── */
.anl-composer {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  padding-bottom: calc(var(--anl-wm-size) * .25);
  color: var(--anl-ink);
  font-family: var(--anl-font);
  font-size: var(--anl-wm-size);
  font-weight: 500;
  letter-spacing: -.03em;
  line-height: .95;
}
/* Full-bleed hairline fix — -100vw covers any viewport width */
.anl-composer::before {
  content: "";
  position: absolute;
  left: -100vw;
  right: -100vw;
  bottom: calc(var(--anl-wm-size) * .15);
  height: 1px;
  background: var(--anl-hairline);
}
.anl-word {
  position: relative;
  z-index: 1;
  display: inline-flex;
  gap: 0;
}
.anl-letter {
  display: inline-block;
  color: var(--anl-ink);
  opacity: 0;
  transform: translateY(115%);
  will-change: opacity, transform;
}

/* ── The dot ────────────────────────────────────────────────────── */
.anl-dot {
  position: relative;
  z-index: 4;
  width: .16em; height: .16em;
  margin-bottom: .06em; margin-left: .06em;
  align-self: flex-end;
  border-radius: 50%;
  background: var(--anl-indigo);
  transform-origin: center bottom;
  animation: anl-dot-roll var(--anl-intro-duration) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards; /* ds-allow: signal hero choreography */
}
@keyframes anl-dot-roll {
  0%   { transform: translate(calc(-1 * var(--anl-roll-distance)), 0) scale(1,1);    opacity: 0 }
  8%   { transform: translate(calc(-1 * var(--anl-roll-distance)), 0) scale(1,1);    opacity: 1 }
  63%  { transform: translate(calc(-.03 * var(--anl-wm-size)), 0) scale(1,1);        opacity: 1 }
  67%  { transform: translate(0, 0) scale(1,1);                                      opacity: 1 }
  73%  { transform: translate(0, 0) scale(1.55, .55);                                opacity: 1 }
  78%  { transform: translate(0, 0) scale(1.96, .4);                                 opacity: 1 }
  82%  { transform: translate(0, 0) scale(1.88, .43);                                opacity: 1 }
  88%  { transform: translate(0, calc(-.075 * var(--anl-wm-size))) scale(.74, 1.34); opacity: 1 }
  93%  { transform: translate(0, 0) scale(1.24, .82);                                opacity: 1 }
  96%  { transform: translate(0, 0) scale(.96, 1.05);                                opacity: 1 }
  100% { transform: translate(0, 0) scale(1,1);                                      opacity: 1 }
}

/* ── Ghost trails — right:0; bottom:.06em anchor fix ────────────── */
/* position:absolute children in flex container: align-self/margin have no effect.
   Anchoring to right:0/bottom:.06em correctly positions all three at the mark's
   resting spot instead of firing at the composer's left edge. */
.anl-trail {
  position: absolute;
  right: 0; bottom: .06em; margin: 0;
  z-index: 2;
  width: .16em; height: .16em;
  border-radius: 50%;
  background: var(--anl-indigo);
  opacity: 0;
}
.anl-trail-1 { animation: anl-ghost-1 var(--anl-intro-duration) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards /* ds-allow: signal hero choreography */ }
.anl-trail-2 { animation: anl-ghost-2 var(--anl-intro-duration) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards /* ds-allow: signal hero choreography */ }
.anl-trail-3 { animation: anl-ghost-3 var(--anl-intro-duration) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards /* ds-allow: signal hero choreography */ }
@keyframes anl-ghost-1 {
  0%,10% { transform: translate(calc(-1 * var(--anl-roll-distance)), 0); opacity: 0 }
  27%    { transform: translate(calc(-.85 * var(--anl-roll-distance)), 0); opacity: .5 }
  50%    { transform: translate(calc(-.2 * var(--anl-roll-distance)), 0); opacity: .26 }
  63%,100% { transform: translate(calc(-.1 * var(--anl-roll-distance)), 0); opacity: 0 }
}
@keyframes anl-ghost-2 {
  0%,13% { transform: translate(calc(-1 * var(--anl-roll-distance)), 0); opacity: 0 }
  30%    { transform: translate(calc(-.78 * var(--anl-roll-distance)), 0); opacity: .36 }
  50%    { transform: translate(calc(-.28 * var(--anl-roll-distance)), 0); opacity: .18 }
  63%,100% { transform: translate(calc(-.16 * var(--anl-roll-distance)), 0); opacity: 0 }
}
@keyframes anl-ghost-3 {
  0%,17% { transform: translate(calc(-1 * var(--anl-roll-distance)), 0); opacity: 0 }
  34%    { transform: translate(calc(-.7 * var(--anl-roll-distance)), 0); opacity: .24 }
  50%    { transform: translate(calc(-.35 * var(--anl-roll-distance)), 0); opacity: .11 }
  63%,100% { transform: translate(calc(-.24 * var(--anl-roll-distance)), 0); opacity: 0 }
}

/* ── Impact ripples — same anchor fix as trails ─────────────────── */
.anl-intro-ripple,
.anl-intro-ripple-slow {
  position: absolute;
  right: 0; bottom: .06em; margin: 0;
  z-index: 1;
  width: .16em; height: .16em;
  border-radius: 50%;
  background: transparent;
  opacity: 0;
  transform: scale(1);
}
.anl-intro-ripple {
  border: 1px solid var(--anl-indigo);
  animation: anl-ripple-fast var(--anl-intro-duration) cubic-bezier(.22,.7,.2,1) 0s 1 forwards; /* ds-allow: signal hero choreography */
}
.anl-intro-ripple-slow {
  border: 1px solid var(--anl-indigo-300);
  animation: anl-ripple-slow var(--anl-intro-duration) cubic-bezier(.22,.7,.2,1) 0s 1 forwards; /* ds-allow: signal hero choreography */
}
@keyframes anl-ripple-fast {
  0%,75% { transform: scale(1); opacity: 0 }
  78%    { transform: scale(1); opacity: .55 }
  100%   { transform: scale(8); opacity: 0 }
}
@keyframes anl-ripple-slow {
  0%,75% { transform: scale(1); opacity: 0 }
  78%    { transform: scale(1); opacity: .35 }
  100%   { transform: scale(16); opacity: 0 }
}

/* ── Bars row ────────────────────────────────────────────────────── */
/* position:relative required for scan-line + bloom-label absolute children */
.anl-bars-row {
  position: relative;
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  gap: .55em;
  height: .9em;
  margin-top: calc(var(--anl-wm-size) * -.1);
  font-size: var(--anl-wm-size);
}
.anl-bar {
  width: .16em;
  height: 0;
  flex: 0 0 auto;
  background: var(--anl-indigo);
  opacity: .4;
  transition: height 360ms cubic-bezier(.22,.7,.2,1), opacity 300ms ease; /* ds-allow: signal hero choreography */
  will-change: height, opacity;
}
.anl-bar.anl-short.anl-risen  { height: .22em; opacity: .38 }
.anl-bar.anl-medium.anl-risen { height: .5em;  opacity: .5  }
.anl-bar.anl-tall.anl-risen   { height: .85em; opacity: .65 }

/* ── Scan line ──────────────────────────────────────────────────── */
/* 1px electromagnetic beam. rAF-driven translateX for exact bloom-trigger timing.
   box-shadow: sensing glow that reads on both OLED and standard LCD. */
.anl-scan-line {
  position: absolute;
  top: -.06em; left: 0;
  width: 1px; height: 1em;
  background: var(--anl-indigo);
  box-shadow: 0 0 5px 1px rgba(79,70,229,.38);
  opacity: 0;
  pointer-events: none;
  z-index: 5;
  transform: translateX(0);
  will-change: transform, opacity;
}

/* ── Bloom label ────────────────────────────────────────────────── */
/* "↑ now" — rises into position above the tall bar on bloom.
   Spatial entrance: translateY(-118%) → translateY(-100%) + opacity. */
.anl-bloom-label {
  position: absolute;
  top: 0; left: 0;
  font-family: var(--anl-mono);
  font-size: clamp(8px, .55vw, 10px);
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--anl-indigo);
  opacity: 0;
  white-space: nowrap;
  pointer-events: none;
  z-index: 6;
  will-change: opacity, transform;
}

/* ── Caption ─────────────────────────────────────────────────────── */
.anl-caption {
  z-index: 2;
  margin: 0;
  color: var(--anl-stone);
  font-family: var(--anl-mono);
  font-size: 11px;
  letter-spacing: .12em;
  text-transform: uppercase;
  opacity: 0;
  animation: anl-caption-in .7s cubic-bezier(.22,.7,.2,1) calc(var(--anl-intro-duration) + .1s) 1 forwards; /* ds-allow: signal hero choreography */
}
@keyframes anl-caption-in {
  0%   { opacity: 0; transform: translateY(4px) }
  100% { opacity: 1; transform: translateY(0) }
}

/* ── Reduced motion: bloomed final state ────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .anl-dot, .anl-trail,
  .anl-intro-ripple, .anl-intro-ripple-slow,
  .anl-pip { animation: none !important }
  .anl-dot { opacity: 1; transform: none }
  .anl-trail, .anl-intro-ripple, .anl-intro-ripple-slow { display: none }
  .anl-bar { transition: none }
  .anl-bar.anl-short  { height: .22em; opacity: .38 }
  .anl-bar.anl-medium { height: .5em;  opacity: .5  }
  .anl-bar.anl-tall   { height: .85em; opacity: 1   }
  .anl-letter { opacity: 1; transform: translateY(0) }
  .anl-caption { animation: none; opacity: 1 }
  .anl-scan-line { display: none }
  .anl-bloom-label { opacity: 1; transform: translateX(-50%) translateY(-100%) }
}

/* ── Responsive chrome ──────────────────────────────────────────── */
@media (max-width: 600px) {
  .anl-chrome-tl { top: 20px; left: 20px }
  .anl-chrome-tr { top: 20px; right: 20px; font-size: 10px }
  .anl-stage { gap: 48px }
}
@media (max-width: 420px) {
  .anl-chrome-tr { display: none }
}
`;
