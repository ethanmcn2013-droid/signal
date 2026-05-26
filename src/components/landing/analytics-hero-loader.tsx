"use client";

/**
 * Analytics hero loader — "the bar appears."
 *
 * Scoped React port of the standalone Signal Studio · Analytics hero card.
 * The dot rolls once across "analytics", revealing each letter; as it reaches
 * the period position, seven bars rise down from the baseline and settle with
 * the dot capping the rightmost bar.
 */

import { useEffect, useRef } from "react";

const LETTERS = "analytics".split("");

export function AnalyticsHeroLoader() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const letterEls = [...root.querySelectorAll<HTMLElement>(".anl-letter")];
    const barEls = [...root.querySelectorAll<HTMLElement>(".anl-bar")];
    const dotEl = root.querySelector<HTMLElement>(".anl-dot");
    const composerEl = root.querySelector<HTMLElement>(".anl-composer");

    if (!dotEl || !composerEl) return;

    if (reduced) {
      letterEls.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
      barEls.forEach((el) => el.classList.add("anl-risen"));
      return;
    }

    const INTRO = 2600;
    const RISE_DURATION = 280;
    const RISE_LEAD = 80;

    const start = performance.now();
    const risenAt = new Array(letterEls.length).fill(null) as Array<number | null>;
    const barRisen = new Array(barEls.length).fill(false);
    let letterCenters: number[] = [];
    let barCenters: number[] = [];
    let rafId = 0;

    const measure = () => {
      const composerLeft = composerEl.getBoundingClientRect().left;
      letterCenters = letterEls.map((el) => {
        const rect = el.getBoundingClientRect();
        return rect.left + rect.width / 2 - composerLeft;
      });
      barCenters = barEls.map((el) => {
        const rect = el.getBoundingClientRect();
        return rect.left + rect.width / 2 - composerLeft;
      });
    };

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const frame = () => {
      const elapsed = performance.now() - start;
      if (elapsed > INTRO + 700) return;

      const composerLeft = composerEl.getBoundingClientRect().left;
      const dotRect = dotEl.getBoundingClientRect();
      const dotX = dotRect.left + dotRect.width / 2 - composerLeft;
      const dotOpacity = parseFloat(getComputedStyle(dotEl).opacity);

      letterEls.forEach((el, index) => {
        const letterX = letterCenters[index];
        if (letterX === undefined) return;

        const distance = letterX - dotX;
        if (risenAt[index] === null && dotOpacity > 0.2 && distance < RISE_LEAD) {
          risenAt[index] = elapsed;
        }

        if (risenAt[index] === null) {
          el.style.opacity = "0";
          el.style.transform = "translateY(115%)";
          return;
        }

        const timeSinceRise = elapsed - risenAt[index];
        const progress = easeOutCubic(
          Math.min(1, Math.max(0, timeSinceRise / RISE_DURATION)),
        );
        el.style.opacity = progress.toString();
        el.style.transform = `translateY(${(1 - progress) * 115}%)`;
      });

      barEls.forEach((el, index) => {
        const barX = barCenters[index];
        if (barX === undefined) return;
        if (!barRisen[index] && dotOpacity > 0.2 && dotX >= barX - 4) {
          el.classList.add("anl-risen");
          barRisen[index] = true;
        }
      });

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(() => {
      measure();
      rafId = requestAnimationFrame(frame);
    });
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section className="anl-hero-section" aria-label="Signal Analytics">
      <div className="anl-chrome anl-chrome-tl">
        <span className="anl-wm">
          <span>signal studio</span>
          <span className="anl-dot-static" />
          <span className="anl-sep">/</span>
          <span>analytics</span>
        </span>
      </div>

      <div className="anl-chrome anl-chrome-tr">
        <span className="anl-pip" aria-hidden />
        <span>samples · 7</span>
      </div>

      <div ref={rootRef} className="anl-stage" aria-hidden>
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
            <span className="anl-bar anl-tall" />
            <span className="anl-bar anl-short" />
            <span className="anl-bar anl-medium" />
            <span className="anl-bar anl-short" />
            <span className="anl-bar anl-short" />
            <span className="anl-bar anl-medium" />
            <span className="anl-bar anl-short" />
          </div>
        </div>

        <p className="anl-caption">the bar appears</p>
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.anl-hero-section{
  --anl-bg:var(--bg, #ffffff);
  --anl-ink:#111111;
  --anl-stone-300:#d8d3c6;
  --anl-stone-500:#8c887e;
  --anl-indigo:#4f46e5;
  --anl-indigo-300:#a5b4fc;
  --anl-hairline:rgba(17,17,17,.06);
  --anl-wm-size:clamp(56px,12vw,168px);
  --anl-roll-distance:calc(var(--anl-wm-size) * 8);
  --anl-intro-duration:2.6s;
  --anl-font:var(--font-geist-sans,'Geist',system-ui,sans-serif);
  --anl-mono:var(--font-geist-mono,'Geist Mono',ui-monospace,monospace);
  position:relative;
  overflow:hidden;
  min-height:min(88svh,900px);
  background:var(--anl-bg);
  color:var(--anl-ink);
  font-family:var(--anl-font);
}

.anl-chrome{
  position:absolute;
  z-index:2;
  display:inline-flex;
  align-items:center;
  gap:12px;
  color:var(--anl-stone-500);
  font-family:var(--anl-mono);
  font-size:11px;
  letter-spacing:.08em;
  text-transform:uppercase;
}
.anl-chrome-tl{top:32px;left:32px}
.anl-chrome-tr{top:32px;right:32px}
.anl-pip{
  display:inline-block;
  width:6px;
  height:6px;
  border-radius:50%;
  background:var(--anl-indigo);
  animation:anl-chrome-pip 1.6s cubic-bezier(.45,.05,.55,.95) infinite;
}
@keyframes anl-chrome-pip{0%,100%{opacity:1}50%{opacity:.35}}

.anl-wm{
  display:inline-flex;
  align-items:baseline;
  color:var(--anl-ink);
  font-family:var(--anl-font);
  font-size:14px;
  font-weight:500;
  letter-spacing:-.025em;
  line-height:.95;
  text-transform:none;
}
.anl-dot-static{
  width:.16em;
  height:.16em;
  margin-bottom:.06em;
  margin-left:.06em;
  align-self:flex-end;
  border-radius:50%;
  background:var(--anl-indigo);
}
.anl-sep{
  margin:0 .4em;
  color:var(--anl-stone-500);
  font-weight:300;
}

.anl-stage{
  min-height:inherit;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:64px;
  padding:88px 24px 72px;
}
.anl-composer-with-bars{
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap:0;
}
.anl-composer{
  position:relative;
  display:inline-flex;
  align-items:baseline;
  padding-bottom:calc(var(--anl-wm-size) * .25);
  color:var(--anl-ink);
  font-family:var(--anl-font);
  font-size:var(--anl-wm-size);
  font-weight:500;
  letter-spacing:-.03em;
  line-height:.95;
}
.anl-composer::before{
  content:"";
  position:absolute;
  left:calc(-1 * var(--anl-wm-size) * 3.2);
  right:calc(-1 * var(--anl-wm-size) * 1.2);
  bottom:calc(var(--anl-wm-size) * .15);
  height:1px;
  background:var(--anl-hairline);
}
.anl-word{
  position:relative;
  z-index:1;
  display:inline-flex;
  gap:0;
}
.anl-letter{
  display:inline-block;
  color:var(--anl-ink);
  opacity:0;
  transform:translateY(115%);
  will-change:opacity,transform;
}

.anl-bars-row{
  z-index:0;
  display:flex;
  flex-direction:row-reverse;
  align-items:flex-start;
  gap:.55em;
  height:.9em;
  margin-top:calc(var(--anl-wm-size) * -.1);
  font-size:var(--anl-wm-size);
}
.anl-bar{
  width:.16em;
  height:0;
  flex:0 0 auto;
  background:var(--anl-indigo);
  opacity:.4;
  transition:height 360ms cubic-bezier(.22,.7,.2,1),opacity 280ms ease;
  will-change:height,opacity;
}
.anl-bar.anl-short.anl-risen{height:.22em;opacity:.38}
.anl-bar.anl-medium.anl-risen{height:.5em;opacity:.5}
.anl-bar.anl-tall.anl-risen{height:.85em;opacity:.65}

.anl-dot{
  position:relative;
  z-index:4;
  width:.16em;
  height:.16em;
  margin-bottom:.06em;
  margin-left:.06em;
  align-self:flex-end;
  border-radius:50%;
  background:var(--anl-indigo);
  transform-origin:center bottom;
  animation:anl-dot-roll var(--anl-intro-duration) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards;
}
@keyframes anl-dot-roll{
  0%{transform:translate(calc(-1 * var(--anl-roll-distance)),0) scale(1,1);opacity:0}
  8%{transform:translate(calc(-1 * var(--anl-roll-distance)),0) scale(1,1);opacity:1}
  63%{transform:translate(calc(-.03 * var(--anl-wm-size)),0) scale(1,1);opacity:1}
  67%{transform:translate(0,0) scale(1,1);opacity:1}
  73%{transform:translate(0,0) scale(1.55,.55);opacity:1}
  78%{transform:translate(0,0) scale(1.96,.4);opacity:1}
  82%{transform:translate(0,0) scale(1.88,.43);opacity:1}
  88%{transform:translate(0,calc(-.075 * var(--anl-wm-size))) scale(.74,1.34);opacity:1}
  93%{transform:translate(0,0) scale(1.24,.82);opacity:1}
  96%{transform:translate(0,0) scale(.96,1.05);opacity:1}
  100%{transform:translate(0,0) scale(1,1);opacity:1}
}

.anl-trail{
  position:absolute;
  z-index:2;
  width:.16em;
  height:.16em;
  margin-bottom:.06em;
  margin-left:.06em;
  align-self:flex-end;
  border-radius:50%;
  background:var(--anl-indigo);
  opacity:0;
}
.anl-trail-1{animation:anl-ghost-1 var(--anl-intro-duration) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards}
.anl-trail-2{animation:anl-ghost-2 var(--anl-intro-duration) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards}
.anl-trail-3{animation:anl-ghost-3 var(--anl-intro-duration) cubic-bezier(.34,1.56,.64,1) 0s 1 forwards}
@keyframes anl-ghost-1{
  0%,10%{transform:translate(calc(-1 * var(--anl-roll-distance)),0);opacity:0}
  27%{transform:translate(calc(-.85 * var(--anl-roll-distance)),0);opacity:.5}
  50%{transform:translate(calc(-.2 * var(--anl-roll-distance)),0);opacity:.26}
  63%,100%{transform:translate(calc(-.1 * var(--anl-roll-distance)),0);opacity:0}
}
@keyframes anl-ghost-2{
  0%,13%{transform:translate(calc(-1 * var(--anl-roll-distance)),0);opacity:0}
  30%{transform:translate(calc(-.78 * var(--anl-roll-distance)),0);opacity:.36}
  50%{transform:translate(calc(-.28 * var(--anl-roll-distance)),0);opacity:.18}
  63%,100%{transform:translate(calc(-.16 * var(--anl-roll-distance)),0);opacity:0}
}
@keyframes anl-ghost-3{
  0%,17%{transform:translate(calc(-1 * var(--anl-roll-distance)),0);opacity:0}
  34%{transform:translate(calc(-.7 * var(--anl-roll-distance)),0);opacity:.24}
  50%{transform:translate(calc(-.35 * var(--anl-roll-distance)),0);opacity:.11}
  63%,100%{transform:translate(calc(-.24 * var(--anl-roll-distance)),0);opacity:0}
}

.anl-intro-ripple,.anl-intro-ripple-slow{
  position:absolute;
  z-index:1;
  width:.16em;
  height:.16em;
  margin-bottom:.06em;
  margin-left:.06em;
  align-self:flex-end;
  border-radius:50%;
  background:transparent;
  opacity:0;
  transform:scale(1);
}
.anl-intro-ripple{
  border:1px solid var(--anl-indigo);
  animation:anl-ripple-fast var(--anl-intro-duration) cubic-bezier(.22,.7,.2,1) 0s 1 forwards;
}
.anl-intro-ripple-slow{
  border:1px solid var(--anl-indigo-300);
  animation:anl-ripple-slow var(--anl-intro-duration) cubic-bezier(.22,.7,.2,1) 0s 1 forwards;
}
@keyframes anl-ripple-fast{
  0%,75%{transform:scale(1);opacity:0}
  78%{transform:scale(1);opacity:.55}
  100%{transform:scale(8);opacity:0}
}
@keyframes anl-ripple-slow{
  0%,75%{transform:scale(1);opacity:0}
  78%{transform:scale(1);opacity:.35}
  100%{transform:scale(16);opacity:0}
}

.anl-caption{
  z-index:2;
  margin:0;
  color:var(--anl-stone-500);
  font-family:var(--anl-mono);
  font-size:11px;
  letter-spacing:.12em;
  text-transform:uppercase;
  opacity:0;
  animation:anl-caption-in .7s cubic-bezier(.22,.7,.2,1) calc(var(--anl-intro-duration) + .1s) 1 forwards;
}
@keyframes anl-caption-in{
  0%{opacity:0;transform:translateY(4px)}
  100%{opacity:1;transform:translateY(0)}
}

@media(prefers-reduced-motion:reduce){
  .anl-dot,
  .anl-trail,
  .anl-intro-ripple,
  .anl-intro-ripple-slow,
  .anl-caption,
  .anl-pip{animation:none!important}
  .anl-dot{opacity:1;transform:none}
  .anl-trail,
  .anl-intro-ripple,
  .anl-intro-ripple-slow{display:none}
  .anl-caption{opacity:1}
  .anl-bar{transition:none}
  .anl-bar.anl-short{height:.22em;opacity:.38}
  .anl-bar.anl-medium{height:.5em;opacity:.5}
  .anl-bar.anl-tall{height:.85em;opacity:.65}
  .anl-letter{opacity:1;transform:translateY(0)}
}

@media(max-width:600px){
  .anl-chrome-tl{top:20px;left:20px}
  .anl-chrome-tr{top:20px;right:20px;font-size:10px}
  .anl-stage{gap:48px}
}
@media(max-width:420px){
  .anl-chrome-tr{display:none}
}
`;
