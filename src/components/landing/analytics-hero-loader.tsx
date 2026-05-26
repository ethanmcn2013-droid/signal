"use client";

/**
 * Analytics hero loader — "8 samples · 0 lies."
 *
 * The dot teleports across the screen in 8 discrete steps (steps(8,end))
 * rather than interpolating. At each tick: an axis hairline lights up below
 * the baseline, a mono sample number flashes above, and the letter at that
 * position snaps into place. When the dot arrives at the period, it freezes.
 * Facts don't move.
 *
 * SAFETY CONTRACT:
 *   · Fully scoped — every class and @keyframes prefixed `anl-`.
 *   · In-flow only — no position:fixed, no inset:0, no high z-index.
 *   · rAF loop cancels after all 8 ticks fire + a short settling moment.
 *   · prefers-reduced-motion → full assembled state, no animation.
 */

import { useEffect, useRef } from "react";

const TICKS = 8;
const TICK_MS = 300; // 8 × 300ms = 2400ms total — matches CSS steps(8,end)

export function AnalyticsHeroLoader() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const wordEl = root.querySelector<HTMLElement>(".anl-word");
    const dotEl = root.querySelector<HTMLElement>(".anl-dot");
    const composerEl = root.querySelector<HTMLElement>(".anl-composer");
    const axisEl = root.querySelector<HTMLElement>(".anl-axis");
    const readoutsEl = root.querySelector<HTMLElement>(".anl-readouts");

    if (!wordEl || !dotEl || !composerEl || !axisEl || !readoutsEl) return;

    const letterEls = [...wordEl.querySelectorAll<HTMLElement>(".anl-letter")];

    if (reduced) {
      letterEls.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
      return;
    }

    const samples = ["0001", "0002", "0003", "0004", "0005", "0006", "0007", "0008"];
    let tickPositions: number[] = [];
    let letterCenters: number[] = [];

    const measure = () => {
      const composerLeft = composerEl.getBoundingClientRect().left;
      // dot's natural final position (ignores the running transform)
      const finalX = dotEl.offsetLeft + dotEl.offsetWidth / 2;
      const cs = getComputedStyle(composerEl);
      const wmSize = parseFloat(cs.fontSize);
      const tickDistance = wmSize * 8;

      tickPositions = [];
      for (let i = 1; i <= TICKS; i++) {
        const offset = tickDistance * (TICKS - i) / TICKS;
        tickPositions.push(finalX - offset);
      }

      letterCenters = letterEls.map((el) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2 - composerLeft;
      });

      // populate axis ticks
      axisEl.innerHTML = "";
      tickPositions.forEach((x) => {
        const t = document.createElement("span");
        t.className = "anl-axis-tick";
        t.style.left = x + "px";
        axisEl.appendChild(t);
      });

      // pre-create readout slots
      readoutsEl.innerHTML = "";
      tickPositions.forEach((x, i) => {
        const r = document.createElement("span");
        r.className = "anl-readout";
        r.style.left = x + "px";
        r.textContent = samples[i];
        readoutsEl.appendChild(r);
      });
    };

    const TOTAL_MS = TICKS * TICK_MS;
    const start = performance.now();
    const firedTicks = new Set<number>();
    let raf = 0;

    const frame = () => {
      const elapsed = performance.now() - start;
      if (elapsed > TOTAL_MS + 800) return; // all done

      const currentStep = Math.min(TICKS, Math.floor(elapsed / TICK_MS));
      for (let i = 1; i <= currentStep; i++) {
        if (firedTicks.has(i)) continue;
        firedTicks.add(i);
        const idx = i - 1;

        // light up axis tick
        const ax = axisEl.children[idx] as HTMLElement | undefined;
        if (ax) {
          ax.classList.add("anl-lit");
          setTimeout(() => {
            ax.classList.remove("anl-lit");
            ax.classList.add("anl-dim");
          }, 240);
        }

        // flash readout
        const ro = readoutsEl.children[idx] as HTMLElement | undefined;
        if (ro) {
          ro.style.transition = "opacity 60ms ease";
          ro.style.opacity = "1";
          ro.style.transform = "translateX(-50%) translateY(0)";
          setTimeout(() => {
            ro.style.transition = "opacity 320ms ease, transform 320ms ease";
            ro.style.opacity = "0";
            ro.style.transform = "translateX(-50%) translateY(-6px)";
          }, 200);
        }

        // reveal letters whose center is at or behind this tick
        const tickX = tickPositions[idx];
        if (tickX === undefined) continue;
        letterEls.forEach((el, li) => {
          const lx = letterCenters[li];
          if (lx === undefined) return;
          if (lx <= tickX + 8 && el.style.opacity !== "1") {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }
        });
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(() => {
      measure();
      raf = requestAnimationFrame(frame);
    });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section className="anl-hero-section" aria-label="Signal Analytics">
      {/* Corner chrome */}
      <div className="anl-chrome anl-chrome-tl">
        <span className="anl-wm">
          signal studio<span className="anl-dot-static" />
          <span className="anl-sep">/</span>analytics
        </span>
      </div>
      <div className="anl-chrome anl-chrome-tr">
        <span className="anl-pip" aria-hidden />
        sampled · 8 reads
      </div>

      {/* Stage */}
      <div ref={rootRef} aria-hidden>
        <div className="anl-composer">
          <span className="anl-axis" id="anl-axis" />
          <span className="anl-readouts" id="anl-readouts" />
          <span className="anl-word">
            {"analytics".split("").map((ch, i) => (
              <span key={i} className="anl-letter">{ch}</span>
            ))}
          </span>
          <span className="anl-dot" />
        </div>
      </div>

      {/* Caption */}
      <p className="anl-caption">8 samples · 0 lies</p>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.anl-hero-section{
  position:relative;overflow:hidden;background:#fafaf7;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  min-height:min(88vh,900px);
  padding:clamp(80px,12vh,160px) 24px clamp(64px,10vh,128px);
}
.anl-hero-section{
  --anl-ink:#111111;
  --anl-stone-300:#d8d3c6;
  --anl-stone-500:#8c887e;
  --anl-indigo:#4f46e5;
  --anl-indigo-300:#a5b4fc;
  --anl-hairline:rgba(17,17,17,0.06);
  --anl-wm-size:clamp(56px,12vw,168px);
  --anl-tick-dist:calc(var(--anl-wm-size) * 8);
  --anl-font:var(--font-geist-sans,'Geist',system-ui,sans-serif);
  --anl-mono:var(--font-geist-mono,'Geist Mono',ui-monospace,monospace);
}

/* ─── Chrome ───────────────────────────────── */
.anl-chrome{
  position:absolute;font-family:var(--anl-mono);font-size:11px;
  letter-spacing:.08em;text-transform:uppercase;color:var(--anl-stone-500);
  display:inline-flex;align-items:center;gap:10px;
}
.anl-chrome-tl{top:28px;left:32px}
.anl-chrome-tr{top:28px;right:32px}
.anl-wm{
  display:inline-flex;align-items:baseline;
  font-family:var(--anl-font);font-weight:500;
  font-size:14px;letter-spacing:-.025em;line-height:.95;
  color:var(--anl-ink);text-transform:none;
}
.anl-dot-static{
  width:.16em;height:.16em;border-radius:50%;
  background:var(--anl-indigo);margin-left:.06em;
  align-self:flex-end;margin-bottom:.06em;flex:0 0 auto;
}
.anl-sep{color:var(--anl-stone-500);margin:0 .4em;font-weight:300}
.anl-pip{
  width:6px;height:6px;border-radius:50%;
  background:var(--anl-indigo);display:inline-block;
  animation:anl-pip-blink 1.6s cubic-bezier(.45,.05,.55,.95) infinite;
}
@keyframes anl-pip-blink{0%,100%{opacity:1}50%{opacity:.35}}

/* ─── Composer ─────────────────────────────── */
.anl-composer{
  position:relative;display:inline-flex;align-items:baseline;
  font-family:var(--anl-font);font-weight:500;
  font-size:var(--anl-wm-size);line-height:.95;
  letter-spacing:-.03em;color:var(--anl-ink);
  padding-bottom:calc(var(--anl-wm-size) * .25);
}
.anl-composer::before{
  content:'';position:absolute;
  left:calc(-1 * var(--anl-wm-size) * 3.2);
  right:calc(-1 * var(--anl-wm-size) * 1.2);
  bottom:calc(var(--anl-wm-size) * .15);
  height:1px;background:var(--anl-hairline);
}
.anl-word{display:inline-flex;gap:0;position:relative;z-index:1}
.anl-letter{
  display:inline-block;opacity:0;transform:translateY(115%);
  color:var(--anl-ink);will-change:opacity,transform;
  /* instant reveal — no eased transition, analytics snaps */
  transition:none;
}

/* ─── The dot — teleports in 8 steps, then freezes ─ */
.anl-dot{
  position:relative;width:.16em;height:.16em;border-radius:50%;
  background:var(--anl-indigo);margin-left:.06em;align-self:flex-end;
  margin-bottom:.06em;z-index:3;
  animation:anl-dot-tick 2.4s steps(8,end) 0s 1 forwards;
}
@keyframes anl-dot-tick{
  0%  {transform:translateX(calc(-1 * var(--anl-tick-dist)));opacity:1}
  100%{transform:translateX(0);opacity:1}
}

/* ─── Axis tick marks ──────────────────────── */
.anl-axis{
  position:absolute;left:0;right:0;
  bottom:calc(var(--anl-wm-size) * .15 - 4px);
  height:8px;pointer-events:none;
}
.anl-axis-tick{
  position:absolute;width:1px;height:8px;
  background:var(--anl-stone-300);transform:translateX(-50%);
  opacity:0;transition:opacity 200ms ease;
}
.anl-axis-tick.anl-lit{background:var(--anl-indigo);opacity:1}
.anl-axis-tick.anl-dim{background:var(--anl-stone-300);opacity:.5}

/* ─── Sample readouts ──────────────────────── */
.anl-readouts{
  position:absolute;left:0;right:0;
  bottom:calc(var(--anl-wm-size) * 1.05);
  pointer-events:none;
}
.anl-readout{
  position:absolute;
  font-family:var(--anl-mono);
  font-size:calc(var(--anl-wm-size) * .13);
  color:var(--anl-indigo);letter-spacing:.05em;
  opacity:0;transform:translateX(-50%);white-space:nowrap;
}

/* ─── Caption ──────────────────────────────── */
.anl-caption{
  font-family:var(--anl-mono);font-size:11px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--anl-stone-500);
  opacity:0;margin-top:48px;
  animation:anl-caption-in .7s cubic-bezier(.22,.7,.2,1) 2.6s 1 forwards;
}
@keyframes anl-caption-in{
  0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}
}

/* ─── Reduced motion ───────────────────────── */
@media(prefers-reduced-motion:reduce){
  .anl-dot,.anl-pip{animation:none!important}
  .anl-dot{transform:translateX(0);opacity:1}
  .anl-letter{opacity:1;transform:none}
  .anl-caption{animation:none;opacity:1}
}

/* ─── Responsive chrome ────────────────────── */
@media(max-width:600px){.anl-chrome-tl{top:18px;left:20px}.anl-chrome-tr{top:18px;right:20px;font-size:10px}}
@media(max-width:420px){.anl-chrome-tr{display:none}}
`;
