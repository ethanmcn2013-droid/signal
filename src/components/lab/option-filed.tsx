"use client";

import { useEffect, useState, type CSSProperties } from "react";

/**
 * Signal hero — concept "Filed" (tactile / polished). Scope prefix: `sig3`.
 *
 * A cold visitor watches a messy desk-pile of small paper cards get calmly
 * filed away until three cards are left standing with weight. The thesis
 * "the signal, not the noise" is felt as a physical act of sorting.
 *
 * Motion model: the settled end-state is the DEFAULT CSS. The scattered pile
 * and the choreography live only inside `@media (prefers-reduced-motion:
 * no-preference)`. So a reduced-motion visitor gets the final settled scene on
 * the very first paint, with zero JS and zero animation. For everyone else the
 * effect flips a single `sig3-play` flag (via rAF) and CSS keyframes with
 * per-card delays run the whole sequence. Every rAF is tracked and cancelled.
 *
 * Self-contained: imports only React. Every class name and keyframe is
 * prefixed `sig3` so nothing leaks out of the section.
 */

type CSSVars = CSSProperties & { [key: `--${string}`]: string | number };

const NOISE: ReadonlyArray<{ sx: string; sy: string; sr: string; text: string }> = [
  { sx: "-30px", sy: "150px", sr: "-3deg", text: "Two label tweaks landed yesterday." },
  { sx: "46px", sy: "60px", sr: "4deg", text: "Printer quote changed by a small amount." },
  { sx: "-60px", sy: "112px", sr: "-5deg", text: "Backdrop samples arrived on time." },
  { sx: "22px", sy: "30px", sr: "2deg", text: "Calendar import finished without action." },
  { sx: "64px", sy: "134px", sr: "5deg", text: "Three closed tasks came from admin cleanup." },
  { sx: "-14px", sy: "84px", sr: "-2deg", text: "Checklist wording changed in one project." },
];

const SIGNAL: ReadonlyArray<{ sx: string; sy: string; sr: string; tab: string; text: string }> = [
  {
    sx: "-46px",
    sy: "96px",
    sr: "4deg",
    tab: "01",
    text: "Claire’s wedding needs the supplier answer today, or Friday’s print window slips.",
  },
  {
    sx: "54px",
    sy: "34px",
    sr: "-5deg",
    tab: "02",
    text: "Name the venue invoice owner before noon so the handoff does not stall.",
  },
  {
    sx: "-28px",
    sy: "-18px",
    sr: "3deg",
    tab: "03",
    text: "Maeve’s case study is ready for one review pass.",
  },
];

export function SignalHeroSig3() {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Reduced motion: the settled state is already the default CSS. Do not
    // schedule anything, and never add the play flag.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    // Two frames so the browser paints the scattered pile before we start
    // filing. Both ids are tracked and cancelled on unmount.
    let rafA = 0;
    let rafB = 0;
    rafA = window.requestAnimationFrame(() => {
      rafB = window.requestAnimationFrame(() => setPlaying(true));
    });

    return () => {
      window.cancelAnimationFrame(rafA);
      window.cancelAnimationFrame(rafB);
    };
  }, []);

  return (
    <section className="sig3-hero-section" aria-label="Signal daily briefing preview">
      <div className="sig3-inner">
        <header className="sig3-head">
          <p className="sig3-eyebrow">TODAY &middot; SAT 4 JUL</p>
          <h1 className="sig3-headline">The signal, not the noise.</h1>
          <p className="sig3-subhead">
            Signal sorts today&rsquo;s pile down to the few things that need you.
          </p>
        </header>

        <div className={playing ? "sig3-stage sig3-play" : "sig3-stage"}>
          <div className="sig3-pile">
            {/* Real content: the three signal cards, readable and ordered. */}
            <ol className="sig3-column">
              {SIGNAL.map((s, i) => (
                <li
                  key={s.tab}
                  className="sig3-signal-card"
                  style={
                    {
                      "--si": i,
                      "--sx": s.sx,
                      "--sy": s.sy,
                      "--sr": s.sr,
                    } as CSSVars
                  }
                >
                  <span className="sig3-rule" aria-hidden="true" />
                  <span className="sig3-tab" aria-hidden="true">
                    {s.tab}
                  </span>
                  <p className="sig3-signal-text">{s.text}</p>
                </li>
              ))}
            </ol>

            {/* Decorative clutter: the six noise cards that get filed away. */}
            <div className="sig3-noise-layer" aria-hidden="true">
              {NOISE.map((n, i) => (
                <div
                  key={n.text}
                  className="sig3-noise-card"
                  style={
                    {
                      "--ni": i,
                      "--sx": n.sx,
                      "--sy": n.sy,
                      "--sr": n.sr,
                    } as CSSVars
                  }
                >
                  <p className="sig3-noise-text">{n.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* The filing tray: a thin honest shelf the noise compresses into. */}
          <div className="sig3-tray" aria-hidden="true" />
          <p className="sig3-filed-label">6 quieter updates, filed.</p>
        </div>
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.sig3-hero-section{
  --font: var(--font-geist-sans, 'Geist', system-ui, sans-serif);
  --mono: var(--font-geist-mono, monospace);
  --ink: #111111;
  --ink-soft: #3f3f46;
  --ink-faint: #71717a;
  --paper: #ffffff;
  --card: #fdfcfb;
  --hairline: rgba(17,17,17,.06);
  --indigo: #4f46e5;

  --sh-soft: 0 14px 22px -8px rgba(17,17,17,.16), 0 3px 6px rgba(17,17,17,.06);
  --sh-light: 0 10px 18px -8px rgba(17,17,17,.12), 0 2px 4px rgba(17,17,17,.05);
  --sh-weight: 0 20px 40px -12px rgba(17,17,17,.24), 0 6px 12px rgba(17,17,17,.10);
  --sh-filed: 0 2px 4px rgba(17,17,17,.10);

  --st-h: 400px;
  --cw: 300px;
  --xm: 1;      /* horizontal scatter multiplier (0 on mobile) */
  --rm: 1;      /* rotation multiplier */
  --nstep: 90ms;

  position: relative;
  box-sizing: border-box;
  min-height: clamp(520px, 62svh, 720px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background-color: var(--paper);
  background-image:
    linear-gradient(to right, rgba(17,17,17,.028) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(17,17,17,.028) 1px, transparent 1px);
  background-size: 34px 34px;
  border-bottom: 1px solid var(--hairline);
  font-family: var(--font);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}
.sig3-hero-section *{ box-sizing: border-box; }

.sig3-inner{
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}

/* ---- Header ---- */
.sig3-head{ margin: 0 0 22px; }
.sig3-eyebrow{
  margin: 0 0 12px;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: .16em;
  color: var(--ink-faint);
}
.sig3-headline{
  margin: 0;
  font-size: clamp(30px, 5.4vw, 46px);
  line-height: 1.04;
  letter-spacing: -.025em;
  font-weight: 600;
  color: var(--ink);
}
.sig3-subhead{
  margin: 12px 0 0;
  max-width: 40ch;
  font-size: clamp(15px, 1.7vw, 17px);
  line-height: 1.5;
  color: var(--ink-soft);
}

/* ---- Stage ---- */
.sig3-stage{
  position: relative;
  height: var(--st-h);
  margin-top: 8px;
}
.sig3-pile{ position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

/* ---- Signal column (real content) ---- */
.sig3-column{
  position: absolute;
  top: 26px;
  left: 50%;
  transform: translateX(-50%);
  width: var(--cw);
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 3;
}
.sig3-signal-card{
  position: relative;
  padding: 16px 18px 16px 22px;
  min-height: 74px;
  display: flex;
  align-items: center;
  background: var(--card);
  border: 1px solid var(--hairline);
  border-radius: 11px;
  box-shadow: var(--sh-weight);
  transform: none;
  opacity: 1;
  will-change: transform, opacity;
}
.sig3-signal-text{
  margin: 0;
  font-size: 15.5px;
  line-height: 1.42;
  letter-spacing: -.006em;
  color: var(--ink);
  font-weight: 480;
}
.sig3-rule{
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--indigo);
  border-radius: 11px 0 0 11px;
  transform: scaleY(1);
  transform-origin: top center;
}
.sig3-tab{
  position: absolute;
  top: 8px; left: 12px;
  font-family: var(--mono);
  font-size: 10.5px;
  letter-spacing: .1em;
  color: var(--indigo);
  opacity: 1;
}

/* ---- Noise layer (decorative clutter) ---- */
.sig3-noise-layer{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
.sig3-noise-card{
  position: absolute;
  left: 50%;
  top: 0;
  width: var(--cw);
  height: 76px;
  padding: 15px 18px;
  overflow: hidden;
  background: var(--card);
  border: 1px solid var(--hairline);
  border-radius: 11px;
  z-index: calc(20 - var(--ni));
  /* settled = filed into the tray as a thin edge */
  transform: translate(-50%, calc(var(--st-h) - 66px - var(--ni) * 8px)) rotate(0deg) scale(.86);
  opacity: .32;
  box-shadow: var(--sh-filed);
  will-change: transform, opacity;
}
.sig3-noise-text{
  margin: 0;
  font-size: 14.5px;
  line-height: 1.4;
  color: var(--ink-soft);
}

/* ---- Filing tray + count ---- */
.sig3-tray{
  position: absolute;
  left: 50%;
  bottom: 6px;
  transform: translateX(-50%);
  width: calc(var(--cw) + 28px);
  height: 46px;
  z-index: 6;
  background: var(--paper);
  border: 1px solid var(--hairline);
  border-top: 1.5px solid rgba(17,17,17,.14);
  border-radius: 4px 4px 9px 9px;
  box-shadow: 0 8px 16px -10px rgba(17,17,17,.18);
}
.sig3-tray::after{
  content: "";
  position: absolute;
  left: 14px; right: 14px; top: 9px;
  height: 1px;
  background: var(--hairline);
}
.sig3-filed-label{
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  z-index: 7;
  margin: 0;
  font-family: var(--mono);
  font-size: 11.5px;
  letter-spacing: .04em;
  color: var(--ink-faint);
  opacity: 1;
  white-space: nowrap;
}

/* =====================================================================
   Motion. Everything below runs ONLY when motion is welcome. The rules
   above already describe the settled rest-state, so reduced-motion users
   see the finished scene immediately with no animation.
   ===================================================================== */
@media (prefers-reduced-motion: no-preference){

  /* Scattered first frame (before the play flag is set). */
  .sig3-stage:not(.sig3-play) .sig3-signal-card{
    transform: translate(calc(var(--sx) * var(--xm)), var(--sy))
               rotate(calc(var(--sr) * var(--rm))) scale(.985);
    opacity: .34;
    box-shadow: var(--sh-light);
  }
  .sig3-stage:not(.sig3-play) .sig3-rule{ transform: scaleY(0); }
  .sig3-stage:not(.sig3-play) .sig3-tab{ opacity: 0; }
  .sig3-stage:not(.sig3-play) .sig3-noise-card{
    transform: translate(calc(-50% + calc(var(--sx) * var(--xm))), var(--sy))
               rotate(calc(var(--sr) * var(--rm))) scale(1);
    opacity: 1;
    box-shadow: var(--sh-soft);
  }
  .sig3-stage:not(.sig3-play) .sig3-filed-label{ opacity: 0; }

  /* Play: run the choreography. Fill both holds the 0% frame during the
     delay (matching the scatter above) and the 100% frame after (matching
     the settled defaults), so there is never a jump. */
  .sig3-stage.sig3-play .sig3-pile{
    animation: sig3-settle 120ms cubic-bezier(.22,1,.36,1) 140ms both;
  }
  .sig3-stage.sig3-play .sig3-noise-card{
    animation: sig3-file 460ms cubic-bezier(.2,.7,.2,1)
      calc(200ms + var(--ni) * var(--nstep)) both;
  }
  .sig3-stage.sig3-play .sig3-signal-card{
    animation:
      sig3-rise 520ms cubic-bezier(.22,1,.36,1) calc(760ms + var(--si) * 110ms) both,
      sig3-weight 240ms cubic-bezier(.4,0,.2,1) calc(1320ms + var(--si) * 80ms) both;
  }
  .sig3-stage.sig3-play .sig3-rule{
    animation: sig3-wipe 240ms cubic-bezier(.4,0,.2,1) calc(1320ms + var(--si) * 80ms) both;
  }
  .sig3-stage.sig3-play .sig3-tab{
    animation: sig3-tab-in 240ms cubic-bezier(.4,0,.2,1) calc(1320ms + var(--si) * 80ms) both;
  }
  .sig3-stage.sig3-play .sig3-filed-label{
    animation: sig3-label-in 300ms cubic-bezier(.4,0,.2,1) 1500ms both;
  }
}

@keyframes sig3-settle{
  0%{ transform: translateY(0); }
  100%{ transform: translateY(2px); }
}

@keyframes sig3-file{
  0%{
    transform: translate(calc(-50% + calc(var(--sx) * var(--xm))), var(--sy))
               rotate(calc(var(--sr) * var(--rm))) scale(1);
    opacity: 1;
    box-shadow: var(--sh-soft);
  }
  100%{
    transform: translate(-50%, calc(var(--st-h) - 66px - var(--ni) * 8px))
               rotate(0deg) scale(.86);
    opacity: .32;
    box-shadow: var(--sh-filed);
  }
}

@keyframes sig3-rise{
  0%{
    transform: translate(calc(var(--sx) * var(--xm)), var(--sy))
               rotate(calc(var(--sr) * var(--rm))) scale(.985);
    opacity: .34;
  }
  52%{
    transform: translate(0px, -8px) rotate(0deg) scale(1.035);
    opacity: 1;
  }
  100%{
    transform: translate(0px, 0px) rotate(0deg) scale(1);
    opacity: 1;
  }
}

@keyframes sig3-weight{
  0%{ box-shadow: var(--sh-light); }
  100%{ box-shadow: var(--sh-weight); }
}

@keyframes sig3-wipe{
  0%{ transform: scaleY(0); }
  100%{ transform: scaleY(1); }
}

@keyframes sig3-tab-in{
  0%{ opacity: 0; transform: translateY(-3px); }
  100%{ opacity: 1; transform: translateY(0); }
}

@keyframes sig3-label-in{
  0%{ opacity: 0; transform: translate(-50%, 4px); }
  100%{ opacity: 1; transform: translate(-50%, 0); }
}

/* ---- Mobile: single in-flow column, no horizontal drift, tighter timing ---- */
@media (max-width: 430px){
  .sig3-hero-section{
    padding: 32px 20px;
    --st-h: 452px;
    --cw: calc(100vw - 40px);
    --xm: 0;          /* file straight down, nothing can overflow */
    --rm: .45;        /* scatter rotation eases to about +/-2deg */
    --nstep: 70ms;    /* tighter stagger */
  }
  .sig3-stage{ overflow: hidden; }
  .sig3-signal-text{ font-size: 15px; }
  .sig3-noise-text{ font-size: 15px; }
  .sig3-tray{ width: calc(var(--cw) + 16px); }
  .sig3-filed-label{ font-size: 11px; }
}
`;
