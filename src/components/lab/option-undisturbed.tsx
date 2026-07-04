"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Signal hero — "Undisturbed" (wildcard lens).
 *
 * A quiet near-white field holds fourteen short grey fragments. Three of them
 * are the lines that matter; at t=0 they are dressed identically to the eleven
 * noise lines. On settle the noise loses weight (drifts up, shrinks, fades,
 * blurs) while the three signal lines gain weight and glide into a centered
 * stack with indigo markers. Once at rest, a fine desktop pointer moving
 * through the field repels the noise up to 26px; the signal stack never flinches.
 *
 * Everything is scoped under the `sig4-` prefix. In-flow only. All timers and
 * rAF handles are tracked and cleared on unmount. prefers-reduced-motion renders
 * the settled state instantly with no interaction attached.
 */

const PREFIX = "sig4";

const NOISE_LINES: readonly string[] = [
  "Two label tweaks landed yesterday.",
  "Printer quote changed by a small amount.",
  "Backdrop samples arrived on time.",
  "Calendar import finished without action.",
  "Three closed tasks came from admin cleanup.",
  "Checklist wording changed in one project.",
  "A supplier email was marked read.",
  "The floor plan file was renamed.",
  "Guest count note synced from the sheet.",
  "Two comments resolved themselves overnight.",
  "The tasting menu draft saved a new version.",
];

const SIGNAL_LINES: readonly string[] = [
  "Claire's wedding needs the supplier answer today or Friday's print window slips.",
  "Name the venue invoice owner before noon so the handoff does not stall.",
  "Maeve's case study is ready for one review pass.",
];

// Repel physics constants.
const REPEL_RADIUS = 120;
const REPEL_MAX = 26;
const LERP = 0.12;

const prefersReduced = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function SignalHeroSig4() {
  // Initialised lazily so reduced-motion clients render settled with no flash.
  const [on, setOn] = useState<boolean>(prefersReduced);
  const [reduced] = useState<boolean>(prefersReduced);

  const fieldRef = useRef<HTMLDivElement | null>(null);
  const innerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const offsetsRef = useRef<{ x: number; y: number }[]>([]);
  const rafRef = useRef<number | null>(null);
  const startRafRef = useRef<number | null>(null);

  useEffect(() => {
    // Reduced motion: the settled state is already on the DOM. Do not animate,
    // do not arm the pointer interaction. The field simply rests, static.
    if (reduced) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Paint the first frame, then flip to the settled state so the CSS
    // transitions (with their per-line delays) carry the whole choreography.
    startRafRef.current = requestAnimationFrame(() => {
      startRafRef.current = requestAnimationFrame(() => setOn(true));
    });

    // The wildcard interaction is a fine-pointer / hover reward only.
    const fine =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const step = () => {
      const nodes = innerRefs.current;
      const p = pointerRef.current;
      let active = false;

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (!node) continue;
        const outer = node.parentElement;
        if (!outer) continue;

        const rect = outer.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        let tx = 0;
        let ty = 0;
        if (p) {
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < REPEL_RADIUS) {
            const force = (1 - dist / REPEL_RADIUS) * REPEL_MAX;
            tx = (dx / dist) * force;
            ty = (dy / dist) * force;
          }
        }

        const cur = offsetsRef.current[i] ?? { x: 0, y: 0 };
        cur.x += (tx - cur.x) * LERP;
        cur.y += (ty - cur.y) * LERP;
        offsetsRef.current[i] = cur;

        if (
          Math.abs(cur.x - tx) > 0.1 ||
          Math.abs(cur.y - ty) > 0.1 ||
          Math.abs(cur.x) > 0.1 ||
          Math.abs(cur.y) > 0.1
        ) {
          active = true;
        }

        node.style.setProperty("--rx", `${cur.x.toFixed(2)}px`);
        node.style.setProperty("--ry", `${cur.y.toFixed(2)}px`);
      }

      // Keep looping while the pointer is present or anything is still moving.
      // Otherwise stop cleanly — no idle spinning.
      if (active || p) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };

    const ensureLoop = () => {
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(step);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
      ensureLoop();
    };
    const onPointerLeave = () => {
      pointerRef.current = null;
      ensureLoop(); // one more pass to ease the noise back to rest
    };

    let armed = false;
    const armTimer = setTimeout(() => {
      const field = fieldRef.current;
      if (!fine || !field) return;
      field.addEventListener("pointermove", onPointerMove);
      field.addEventListener("pointerleave", onPointerLeave);
      armed = true;
    }, 1550);
    timeouts.push(armTimer);

    return () => {
      timeouts.forEach(clearTimeout);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (startRafRef.current !== null) cancelAnimationFrame(startRafRef.current);
      rafRef.current = null;
      startRafRef.current = null;
      if (armed) {
        const field = fieldRef.current;
        if (field) {
          field.removeEventListener("pointermove", onPointerMove);
          field.removeEventListener("pointerleave", onPointerLeave);
        }
      }
    };
  }, [reduced]);

  const stateClass = `${on ? ` ${PREFIX}-on` : ""}${reduced ? ` ${PREFIX}-reduced` : ""}`;

  return (
    <section className={`${PREFIX}-hero-section${stateClass}`} aria-label="Signal">
      <div className={`${PREFIX}-inner`}>
        <header className={`${PREFIX}-head`}>
          <p className={`${PREFIX}-eyebrow`}>Today</p>
          <h1 className={`${PREFIX}-headline`}>The signal, not the noise.</h1>
          <p className={`${PREFIX}-subhead`}>
            Every day brings a pile of updates. Signal shows the few that need you today.
          </p>
        </header>

        <div className={`${PREFIX}-field`} ref={fieldRef}>
          {/* Decorative noise layer. Suppressed on settle, repelled by the pointer. */}
          <div className={`${PREFIX}-noise-layer`} aria-hidden="true">
            {NOISE_LINES.map((line, i) => (
              <div key={line} className={`${PREFIX}-noise ${PREFIX}-n${i + 1}`}>
                <span
                  className={`${PREFIX}-noise-inner`}
                  ref={(el) => {
                    innerRefs.current[i] = el;
                  }}
                >
                  {line}
                </span>
              </div>
            ))}
          </div>

          {/* The three lines that matter. Anchored — the pointer never moves them. */}
          <div className={`${PREFIX}-signal`}>
            {SIGNAL_LINES.map((line, i) => (
              <div key={line} className={`${PREFIX}-sline ${PREFIX}-s${i + 1}`}>
                <span className={`${PREFIX}-marker`} aria-hidden="true" />
                <span className={`${PREFIX}-stext`}>{line}</span>
              </div>
            ))}
            <span className={`${PREFIX}-underline`} aria-hidden="true" />
          </div>
        </div>

        <p className={`${PREFIX}-microcopy`}>
          Move across the field. The noise scatters. The signal stays put.
        </p>
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.${PREFIX}-hero-section {
  --font: var(--font-geist-sans, 'Geist', system-ui, sans-serif);
  --mono: var(--font-geist-mono, monospace);
  --ink: #111111;
  --ink-soft: #3f3f46;
  --ink-faint: #71717a;
  --paper: #ffffff;
  --hairline: rgba(17,17,17,.06);
  --indigo: #4f46e5;

  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: clamp(520px, 62svh, 720px);
  padding: clamp(28px, 5vw, 64px) clamp(20px, 5vw, 56px);
  background: var(--paper);
  border-bottom: 1px solid var(--hairline);
  font-family: var(--font);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}

.${PREFIX}-hero-section *,
.${PREFIX}-hero-section *::before,
.${PREFIX}-hero-section *::after { box-sizing: border-box; }

.${PREFIX}-inner {
  width: 100%;
  max-width: 1040px;
  display: flex;
  flex-direction: column;
  gap: clamp(18px, 3vw, 30px);
}

/* ---- Header ---------------------------------------------------------- */
.${PREFIX}-head {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 96px;
}

.${PREFIX}-eyebrow {
  margin: 0;
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--indigo);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 500ms cubic-bezier(.22,1,.36,1) 1010ms,
              transform 500ms cubic-bezier(.22,1,.36,1) 1010ms;
}

.${PREFIX}-headline {
  margin: 0;
  font-size: clamp(30px, 5.2vw, 52px);
  line-height: 1.04;
  letter-spacing: -0.02em;
  font-weight: 600;
  color: var(--ink);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 500ms cubic-bezier(.22,1,.36,1) 1050ms,
              transform 500ms cubic-bezier(.22,1,.36,1) 1050ms;
}

.${PREFIX}-subhead {
  margin: 0;
  max-width: 46ch;
  font-size: clamp(15px, 2.1vw, 18px);
  line-height: 1.5;
  color: var(--ink-soft);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 500ms cubic-bezier(.22,1,.36,1) 1130ms,
              transform 500ms cubic-bezier(.22,1,.36,1) 1130ms;
}

/* ---- Field ----------------------------------------------------------- */
.${PREFIX}-field {
  position: relative;
  flex: 1 1 auto;
  min-height: clamp(300px, 40svh, 440px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* ---- Noise ----------------------------------------------------------- */
.${PREFIX}-noise-layer { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 1; }

.${PREFIX}-noise {
  position: absolute;
  max-width: 210px;
  --dy0: 0px;
  --sc: 1;
  transform: translateY(var(--dy0)) scale(var(--sc));
  opacity: .5;
  filter: none;
  will-change: transform, opacity, filter;
  transition: transform 600ms cubic-bezier(.4,0,.2,1),
              opacity 600ms cubic-bezier(.4,0,.2,1),
              filter 600ms cubic-bezier(.4,0,.2,1);
}

.${PREFIX}-noise-inner {
  display: block;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  color: var(--ink-faint);
  /* Repel offset, driven per-frame by JS. No transition — the rAF lerp is the smoothing. */
  transform: translate(var(--rx, 0px), var(--ry, 0px));
}

/* Settled noise: lose weight, drift up, shrink, fade, blur. Staggered 30ms. */
.${PREFIX}-on .${PREFIX}-noise {
  --sc: .82;
  opacity: .14;
  filter: blur(.6px);
}
.${PREFIX}-on .${PREFIX}-n1  { transition-delay: 150ms; }
.${PREFIX}-on .${PREFIX}-n2  { transition-delay: 180ms; }
.${PREFIX}-on .${PREFIX}-n3  { transition-delay: 210ms; }
.${PREFIX}-on .${PREFIX}-n4  { transition-delay: 240ms; }
.${PREFIX}-on .${PREFIX}-n5  { transition-delay: 270ms; }
.${PREFIX}-on .${PREFIX}-n6  { transition-delay: 300ms; }
.${PREFIX}-on .${PREFIX}-n7  { transition-delay: 330ms; }
.${PREFIX}-on .${PREFIX}-n8  { transition-delay: 360ms; }
.${PREFIX}-on .${PREFIX}-n9  { transition-delay: 390ms; }
.${PREFIX}-on .${PREFIX}-n10 { transition-delay: 420ms; }
.${PREFIX}-on .${PREFIX}-n11 { transition-delay: 450ms; }

/* Per-line drift (randomised 24-64px upward) + scattered start positions. */
.${PREFIX}-n1  { left: 4%;  top: 12%; }  .${PREFIX}-on .${PREFIX}-n1  { --dy0: -38px; }
.${PREFIX}-n2  { left: 58%; top: 8%; }   .${PREFIX}-on .${PREFIX}-n2  { --dy0: -52px; }
.${PREFIX}-n3  { left: 77%; top: 24%; }  .${PREFIX}-on .${PREFIX}-n3  { --dy0: -28px; }
.${PREFIX}-n4  { left: 7%;  top: 40%; }  .${PREFIX}-on .${PREFIX}-n4  { --dy0: -60px; }
.${PREFIX}-n5  { left: 2%;  top: 70%; }  .${PREFIX}-on .${PREFIX}-n5  { --dy0: -34px; }
.${PREFIX}-n6  { left: 67%; top: 58%; }  .${PREFIX}-on .${PREFIX}-n6  { --dy0: -46px; }
.${PREFIX}-n7  { left: 80%; top: 74%; }  .${PREFIX}-on .${PREFIX}-n7  { --dy0: -30px; }
.${PREFIX}-n8  { left: 38%; top: 3%; }   .${PREFIX}-on .${PREFIX}-n8  { --dy0: -58px; }
.${PREFIX}-n9  { left: 24%; top: 84%; }  .${PREFIX}-on .${PREFIX}-n9  { --dy0: -42px; }
.${PREFIX}-n10 { left: 52%; top: 88%; }  .${PREFIX}-on .${PREFIX}-n10 { --dy0: -26px; }
.${PREFIX}-n11 { left: 86%; top: 44%; }  .${PREFIX}-on .${PREFIX}-n11 { --dy0: -50px; }

/* ---- Signal stack ---------------------------------------------------- */
.${PREFIX}-signal {
  position: relative;
  z-index: 2;
  width: min(560px, 84%);
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 2.4vw, 24px);
  padding-bottom: 18px;
}

.${PREFIX}-sline {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  transform: translate(var(--dx, 0px), var(--dy, 0px));
  transition: transform 700ms cubic-bezier(.16,1,.3,1);
}

.${PREFIX}-marker {
  flex: 0 0 auto;
  width: 3px;
  align-self: stretch;
  min-height: 18px;
  background: var(--indigo);
  border-radius: 2px;
  transform: scaleY(0);
  transform-origin: top center;
  transition: transform 300ms cubic-bezier(.2,.8,.2,1);
}

.${PREFIX}-stext {
  font-size: 13px;
  font-weight: 400;
  line-height: 1.35;
  letter-spacing: 0;
  color: var(--ink-faint);
  transition: font-size 700ms cubic-bezier(.16,1,.3,1),
              color 700ms cubic-bezier(.16,1,.3,1),
              font-weight 700ms cubic-bezier(.16,1,.3,1),
              letter-spacing 700ms cubic-bezier(.16,1,.3,1);
}

.${PREFIX}-underline {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: var(--indigo);
  opacity: .55;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 300ms cubic-bezier(.2,.8,.2,1) 900ms;
}

/* Scattered start offsets for the signal lines (relative to their stack slot). */
.${PREFIX}-s1 { --dx: -240px; --dy: -120px; }
.${PREFIX}-s2 { --dx: 250px;  --dy: -30px; }
.${PREFIX}-s3 { --dx: -170px; --dy: 150px; }

/* Signal settle: glide to centre, deepen to ink, thicken, grow 13 -> 17px. */
.${PREFIX}-on .${PREFIX}-sline { transform: translate(0px, 0px); }
.${PREFIX}-on .${PREFIX}-stext {
  font-size: 17px;
  font-weight: 500;
  color: var(--ink);
}
.${PREFIX}-on .${PREFIX}-s1 { transition-delay: 150ms; }
.${PREFIX}-on .${PREFIX}-s1 .${PREFIX}-stext { transition-delay: 150ms; }
.${PREFIX}-on .${PREFIX}-s2 { transition-delay: 240ms; }
.${PREFIX}-on .${PREFIX}-s2 .${PREFIX}-stext { transition-delay: 240ms; }
.${PREFIX}-on .${PREFIX}-s3 { transition-delay: 330ms; }
.${PREFIX}-on .${PREFIX}-s3 .${PREFIX}-stext { transition-delay: 330ms; }

/* Indigo markers draw top-to-bottom, staggered 70ms starting at 900ms. */
.${PREFIX}-on .${PREFIX}-s1 .${PREFIX}-marker { transform: scaleY(1); transition-delay: 900ms; }
.${PREFIX}-on .${PREFIX}-s2 .${PREFIX}-marker { transform: scaleY(1); transition-delay: 970ms; }
.${PREFIX}-on .${PREFIX}-s3 .${PREFIX}-marker { transform: scaleY(1); transition-delay: 1040ms; }

.${PREFIX}-on .${PREFIX}-underline { transform: scaleX(1); }

/* Header reveal on settle. */
.${PREFIX}-on .${PREFIX}-eyebrow,
.${PREFIX}-on .${PREFIX}-headline,
.${PREFIX}-on .${PREFIX}-subhead { opacity: 1; transform: translateY(0); }

/* ---- Microcopy ------------------------------------------------------- */
.${PREFIX}-microcopy {
  margin: 0;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: .01em;
  color: var(--ink-faint);
  opacity: 0;
  transition: opacity 500ms ease 1250ms;
}
.${PREFIX}-on .${PREFIX}-microcopy { opacity: .7; }

/* ---- Reduced motion: settled state, instant, no transitions --------- */
.${PREFIX}-reduced .${PREFIX}-eyebrow,
.${PREFIX}-reduced .${PREFIX}-headline,
.${PREFIX}-reduced .${PREFIX}-subhead,
.${PREFIX}-reduced .${PREFIX}-noise,
.${PREFIX}-reduced .${PREFIX}-sline,
.${PREFIX}-reduced .${PREFIX}-stext,
.${PREFIX}-reduced .${PREFIX}-marker,
.${PREFIX}-reduced .${PREFIX}-underline,
.${PREFIX}-reduced .${PREFIX}-microcopy {
  transition: none !important;
}

/* ---- Mobile ---------------------------------------------------------- */
@media (max-width: 520px) {
  .${PREFIX}-head { min-height: 84px; }

  .${PREFIX}-signal { width: 90%; gap: 22px; }
  .${PREFIX}-stext { font-size: 12px; }
  .${PREFIX}-on .${PREFIX}-stext { font-size: 16px; }

  /* Smaller scatter so nothing overflows the narrower field. */
  .${PREFIX}-s1 { --dx: -70px;  --dy: -110px; }
  .${PREFIX}-s2 { --dx: 80px;   --dy: -40px; }
  .${PREFIX}-s3 { --dx: -60px;  --dy: 150px; }

  /* Drop to 7 noise lines and re-place them within the smaller field. */
  .${PREFIX}-n8, .${PREFIX}-n9, .${PREFIX}-n10, .${PREFIX}-n11 { display: none; }
  .${PREFIX}-noise { max-width: 150px; }
  .${PREFIX}-n1 { left: 2%;  top: 8%; }
  .${PREFIX}-n2 { left: 54%; top: 4%; }
  .${PREFIX}-n3 { left: 62%; top: 24%; }
  .${PREFIX}-n4 { left: 1%;  top: 44%; }
  .${PREFIX}-n5 { left: 3%;  top: 82%; }
  .${PREFIX}-n6 { left: 60%; top: 70%; }
  .${PREFIX}-n7 { left: 66%; top: 90%; }

  /* Intro timings shortened ~30% via reduced delays. */
  .${PREFIX}-on .${PREFIX}-s1 { transition-delay: 100ms; }
  .${PREFIX}-on .${PREFIX}-s1 .${PREFIX}-stext { transition-delay: 100ms; }
  .${PREFIX}-on .${PREFIX}-s2 { transition-delay: 170ms; }
  .${PREFIX}-on .${PREFIX}-s2 .${PREFIX}-stext { transition-delay: 170ms; }
  .${PREFIX}-on .${PREFIX}-s3 { transition-delay: 240ms; }
  .${PREFIX}-on .${PREFIX}-s3 .${PREFIX}-stext { transition-delay: 240ms; }
  .${PREFIX}-on .${PREFIX}-s1 .${PREFIX}-marker { transition-delay: 640ms; }
  .${PREFIX}-on .${PREFIX}-s2 .${PREFIX}-marker { transition-delay: 690ms; }
  .${PREFIX}-on .${PREFIX}-s3 .${PREFIX}-marker { transition-delay: 740ms; }
  .${PREFIX}-on .${PREFIX}-underline { transition-delay: 640ms; }
}

/* Coarse pointer: hide the desktop-only interaction hint. */
@media (pointer: coarse) {
  .${PREFIX}-microcopy { display: none; }
}
`;
