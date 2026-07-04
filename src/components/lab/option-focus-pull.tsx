"use client";

import { useEffect, useState, type CSSProperties } from "react";

/**
 * Signal hero — "Focus Pull" (lens: focus-pull, resolved-frame rebuild).
 *
 * A cold visitor watches an unfocused day of updates settle into soft depth on
 * the right while exactly three lines rack into crisp focus, registered against
 * a single indigo focus plane on one left editorial axis. The promise "the
 * signal, not the noise" is felt as a lens landing, not read as a claim.
 *
 * The resolved frame is the point: one left axis, one continuous indigo plane
 * the lines register against, a live z-mapped depth field biased into the freed
 * right gutter, and a sweep that overlaps the headline so the frame is never
 * static-then-moving.
 *
 * Self-contained: no project imports except React. Everything is inline and
 * scoped with the `sig2` prefix so nothing leaks. In-flow only — no fixed
 * positioning, no inset:0, no escaping z-index. Motion is choreographed with
 * rAF + timers that are all cancelled on unmount, and the whole intro
 * short-circuits to the settled state under prefers-reduced-motion.
 */

const PREFIX = "sig2";

// Allow CSS custom properties in inline style objects under strict TS.
type CSSVars = CSSProperties & { [key: `--${string}`]: string | number };

type NoiseFragment = {
  text: string;
  left: number; // %
  top: number; // %
  z: number; // 0 far .. 1 near
  size: number; // px
  op0: number; // base (first-frame) opacity
  sc0: number; // base (first-frame) scale
  dx: number; // parallax drift px
  dy: number; // recede translateY px
  order: number; // depth stagger order (far first)
  setOp: number; // settled opacity (z-mapped)
  setBlur: number; // settled blur px (z-mapped)
  setSc: number; // settled scale (z-mapped)
  mobileHidden?: boolean;
};

// Six quieter updates — the noise that recedes but never vanishes. Ordered by
// depth so far layers give up focus first (order 0) and near layers last. The
// field is biased into the freed right gutter; two fragments stay left but deep
// and faint so the layering wraps behind the axis without crowding the text.
// Settle vars are interpolated linearly by z: far z=0.05 -> op .05 / blur 22 /
// scale .80; near z=1.0 -> op .12 / blur 9 / scale .90.
const NOISE: NoiseFragment[] = [
  { text: "Two label tweaks landed yesterday.", left: 8, top: 27, z: 0.05, size: 14, op0: 0.5, sc0: 0.9, dx: -2, dy: 8, order: 0, setOp: 0.05, setBlur: 22, setSc: 0.8 },
  { text: "Backdrop samples arrived on time.", left: 13, top: 71, z: 0.2, size: 14, op0: 0.5, sc0: 0.94, dx: -2, dy: 9, order: 1, setOp: 0.061, setBlur: 20, setSc: 0.816 },
  { text: "Printer quote changed by a small amount.", left: 57, top: 21, z: 0.4, size: 15, op0: 0.55, sc0: 0.98, dx: 2, dy: 7, order: 2, setOp: 0.076, setBlur: 17.2, setSc: 0.837 },
  { text: "Calendar import finished without action.", left: 74, top: 31, z: 0.6, size: 16, op0: 0.55, sc0: 1.02, dx: 2, dy: 10, order: 3, setOp: 0.091, setBlur: 14.5, setSc: 0.858 },
  { text: "Three closed tasks came from admin cleanup.", left: 62, top: 58, z: 0.8, size: 15, op0: 0.58, sc0: 1.04, dx: 2, dy: 6, order: 4, setOp: 0.105, setBlur: 11.7, setSc: 0.879, mobileHidden: true },
  { text: "Checklist wording changed in one project.", left: 82, top: 67, z: 1.0, size: 17, op0: 0.6, sc0: 1.06, dx: 2, dy: 6, order: 5, setOp: 0.12, setBlur: 9, setSc: 0.9, mobileHidden: true },
];

type Bokeh = { left: number; top: number; size: number; op: number; blur: number; mobileHidden?: boolean };

// Four faint indigo highlights that dilate as the plane sweeps past, biased into
// the right gutter. Two settle stronger, two fade back.
const BOKEH: Bokeh[] = [
  { left: 63, top: 30, size: 118, op: 0.1, blur: 20 },
  { left: 83, top: 44, size: 64, op: 0.05, blur: 30 },
  { left: 58, top: 66, size: 104, op: 0.1, blur: 20, mobileHidden: true },
  { left: 78, top: 70, size: 34, op: 0.05, blur: 30, mobileHidden: true },
];

const SIGNAL_LINES = [
  "Claire’s wedding needs the supplier answer today or Friday’s print window slips.",
  "Name the venue invoice owner before noon so the handoff does not stall.",
  "Maeve’s case study is ready for one review pass.",
];

// AF-bracket corners: label, position edges, and each corner's own outward
// diagonal so the box converges and locks onto the group.
const CORNERS = [
  { key: "tl", cls: `${PREFIX}-corner-tl`, tx: "-6px", ty: "-6px" },
  { key: "tr", cls: `${PREFIX}-corner-tr`, tx: "6px", ty: "-6px" },
  { key: "bl", cls: `${PREFIX}-corner-bl`, tx: "-6px", ty: "6px" },
  { key: "br", cls: `${PREFIX}-corner-br`, tx: "6px", ty: "6px" },
] as const;

type Mode = "pre" | "animate" | "static";

export function SignalHeroSig2() {
  // "pre" shows the soft first frame with no motion until the effect decides.
  const [mode, setMode] = useState<Mode>("pre");
  // Once the run is done we strip will-change and drop the focus bracket.
  const [atRest, setAtRest] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Reduced motion: render the settled state instantly. No rAF, no timers.
    if (media.matches) {
      setMode("static");
      setAtRest(true);
      return;
    }

    const rafIds: number[] = [];
    const timerIds: ReturnType<typeof setTimeout>[] = [];

    // Kick the animation off after the first paint so keyframes start clean
    // from the soft first frame. Mount-triggered, self-starting, no observer.
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        setMode("animate");
      });
      rafIds.push(raf2);
    });
    rafIds.push(raf1);

    // Total choreography lands by ~2s; strip will-change / bracket shortly after
    // so low-end devices are not left holding hints.
    const restTimer = setTimeout(() => setAtRest(true), 2100);
    timerIds.push(restTimer);

    return () => {
      rafIds.forEach((id) => cancelAnimationFrame(id));
      timerIds.forEach((id) => clearTimeout(id));
    };
  }, []);

  const running = mode === "animate";
  const isStatic = mode === "static";

  const sectionClass = [
    `${PREFIX}-hero-section`,
    running ? `${PREFIX}-run` : "",
    isStatic ? `${PREFIX}-static` : "",
    atRest ? `${PREFIX}-rest` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClass} style={ROOT_VARS}>
      {/* Decorative depth field — bokeh behind, soft noise fragments in front. */}
      <div className={`${PREFIX}-field`} aria-hidden="true">
        {BOKEH.map((b, i) => (
          <span
            key={`b-${i}`}
            className={`${PREFIX}-bokeh${b.mobileHidden ? ` ${PREFIX}-hide-mobile` : ""}`}
            style={
              {
                left: `${b.left}%`,
                top: `${b.top}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                "--sig2-bk-op": b.op,
                "--sig2-bk-blur": `${b.blur}px`,
                animationDelay: `calc((260ms + ${i} * 40ms) * var(--sig2-speed))`,
              } as CSSVars
            }
          />
        ))}
        {NOISE.map((n, i) => (
          <span
            key={`n-${i}`}
            className={`${PREFIX}-noise${n.mobileHidden ? ` ${PREFIX}-hide-mobile` : ""}`}
            style={
              {
                left: `${n.left}%`,
                top: `${n.top}%`,
                "--sig2-dx": `${n.dx}px`,
              } as CSSVars
            }
          >
            <span
              className={`${PREFIX}-noise-inner`}
              style={
                {
                  fontSize: `${n.size}px`,
                  "--sig2-op0": n.op0,
                  "--sig2-sc0": n.sc0,
                  "--sig2-dy": `${n.dy}px`,
                  "--sig2-set-op": n.setOp,
                  "--sig2-set-blur": `${n.setBlur}px`,
                  "--sig2-set-sc": n.setSc,
                  animationDelay: `calc((220ms + ${n.order} * var(--sig2-noise-stagger)) * var(--sig2-speed))`,
                } as CSSVars
              }
            >
              {n.text}
            </span>
          </span>
        ))}
      </div>

      {/* The real, readable content — one left editorial axis. */}
      <div className={`${PREFIX}-col`}>
        <p className={`${PREFIX}-eyebrow`}>The signal, not the noise</p>

        <h1 className={`${PREFIX}-headline`}>Today, in focus.</h1>

        <p className={`${PREFIX}-subhead`}>
          Everything arrived at once. These are the three that need you today.
        </p>

        <div className={`${PREFIX}-signal-wrap`}>
          <ul className={`${PREFIX}-signal-list`}>
            {SIGNAL_LINES.map((line, i) => (
              <li
                key={`s-${i}`}
                className={`${PREFIX}-signal`}
                style={
                  {
                    "--sig2-line-delay": `calc((640ms + ${i} * 110ms) * var(--sig2-speed))`,
                    "--sig2-mark-delay": `calc((860ms + ${i} * 110ms) * var(--sig2-speed))`,
                    "--sig2-tick-w": i === 0 ? "8px" : "6px",
                  } as CSSVars
                }
              >
                <span className={`${PREFIX}-marker`} aria-hidden="true" />
                <span className={`${PREFIX}-signal-text`}>{line}</span>
              </li>
            ))}
          </ul>

          {/* Autofocus-confirm bracket — converges, locks, releases. Run-only. */}
          {running && !atRest && (
            <div className={`${PREFIX}-bracket`} aria-hidden="true">
              {CORNERS.map((c, i) => (
                <span
                  key={c.key}
                  className={`${PREFIX}-corner ${c.cls}`}
                  style={
                    {
                      "--sig2-tx": c.tx,
                      "--sig2-ty": c.ty,
                      animationDelay: `calc((1300ms + ${i} * 40ms) * var(--sig2-speed))`,
                    } as CSSVars
                  }
                />
              ))}
            </div>
          )}
        </div>

        <p className={`${PREFIX}-microcopy`}>Six quieter updates set aside for later.</p>
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const ROOT_VARS: CSSVars = {
  "--sig2-font": "var(--font-geist-sans, 'Geist', system-ui, sans-serif)",
  "--sig2-mono": "var(--font-geist-mono, monospace)",
  "--sig2-ink": "#111111",
  "--sig2-ink-soft": "#3f3f46",
  "--sig2-ink-faint": "#71717a",
  "--sig2-paper": "#ffffff",
  "--sig2-hairline": "rgba(17,17,17,.06)",
  "--sig2-indigo": "#4f46e5",
  "--sig2-indigo-soft": "rgba(79,70,229,.12)",
  // One signature curve for the rack (long decelerating tail = optics settling),
  // and a gentle curve reserved strictly for opacity soft-ins.
  "--sig2-ease-rack": "cubic-bezier(0.22,0.61,0.18,1)",
  "--sig2-ease-soft": "cubic-bezier(0.16,1,0.3,1)",
  // Motion tuning (overridden on mobile).
  "--sig2-speed": 1,
  "--sig2-noise-stagger": "60ms",
  "--sig2-field-blur": "7px",
};

const CSS = `
.${PREFIX}-hero-section{
  position:relative;
  overflow:hidden;
  box-sizing:border-box;
  min-height:clamp(520px, 62svh, 720px);
  display:flex;
  flex-direction:row;
  align-items:center;
  justify-content:flex-start;
  padding:56px 24px;
  background:
    radial-gradient(130% 110% at 82% 50%, #ffffff 60%, rgba(17,17,17,.028) 100%),
    radial-gradient(120% 90% at 28% 8%, #ffffff 0%, #fcfcfd 60%, #fafafb 100%);
  border-bottom:1px solid var(--sig2-hairline);
  font-family:var(--sig2-font);
  color:var(--sig2-ink);
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  text-rendering:optimizeLegibility;
}

/* ---- Decorative depth field ---- */
.${PREFIX}-field{
  position:absolute;
  top:0;left:0;
  width:100%;height:100%;
  z-index:0;
  pointer-events:none;
}

.${PREFIX}-bokeh{
  position:absolute;
  border-radius:50%;
  background:var(--sig2-indigo-soft);
  transform:translate(-50%,-50%) scale(1.12);
  opacity:var(--sig2-bk-op);
  filter:blur(var(--sig2-bk-blur));
}
.${PREFIX}-run .${PREFIX}-bokeh{
  will-change:transform,opacity,filter;
  animation:${PREFIX}-bokeh-dilate calc(600ms * var(--sig2-speed))
    var(--sig2-ease-rack) both;
}
.${PREFIX}-static .${PREFIX}-bokeh{
  transform:translate(-50%,-50%) scale(1.12);
  opacity:var(--sig2-bk-op);
  filter:blur(var(--sig2-bk-blur));
}

.${PREFIX}-noise{
  position:absolute;
  transform:translate(-50%,-50%) translateX(0);
  max-width:min(40vw,300px);
}
.${PREFIX}-run .${PREFIX}-noise{
  animation:${PREFIX}-drift calc(650ms * var(--sig2-speed)) ease-out both;
}
.${PREFIX}-noise-inner{
  display:block;
  font-family:var(--sig2-font);
  font-weight:450;
  line-height:1.25;
  letter-spacing:-0.01em;
  text-align:left;
  color:var(--sig2-ink-faint);
  transform:translateY(0) scale(var(--sig2-sc0));
  opacity:var(--sig2-op0);
  filter:blur(var(--sig2-field-blur));
  transform-origin:center;
}
.${PREFIX}-run .${PREFIX}-noise-inner{
  will-change:filter,transform,opacity;
  animation:${PREFIX}-recede calc(600ms * var(--sig2-speed))
    var(--sig2-ease-rack) both;
}
.${PREFIX}-static .${PREFIX}-noise{
  transform:translate(-50%,-50%) translateX(var(--sig2-dx));
}
.${PREFIX}-static .${PREFIX}-noise-inner{
  transform:translateY(var(--sig2-dy)) scale(var(--sig2-set-sc));
  opacity:var(--sig2-set-op);
  filter:blur(var(--sig2-set-blur));
}

/* ---- Content column — one left editorial axis ---- */
.${PREFIX}-col{
  position:relative;
  z-index:1;
  flex:0 1 720px;
  min-width:0;
  max-width:720px;
  margin-left:max(24px, calc(50% - 480px));
  margin-right:24px;
  box-sizing:border-box;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  text-align:left;
}

.${PREFIX}-eyebrow{
  margin:0 0 16px;
  font-family:var(--sig2-mono);
  font-size:11px;
  letter-spacing:.2em;
  text-transform:uppercase;
  color:var(--sig2-ink-faint);
  opacity:1;
}

.${PREFIX}-headline{
  margin:0 0 16px;
  margin-left:-0.02em;
  font-size:clamp(32px,5.6vw,56px);
  line-height:1.03;
  font-weight:640;
  letter-spacing:-0.035em;
  text-wrap:balance;
  color:var(--sig2-ink);
  /* Soft first frame. */
  filter:blur(6px);
  opacity:0;
}
.${PREFIX}-run .${PREFIX}-headline{
  will-change:filter,opacity;
  animation:${PREFIX}-headline-rack calc(500ms * var(--sig2-speed))
    var(--sig2-ease-rack) both;
  animation-delay:calc(120ms * var(--sig2-speed));
}
.${PREFIX}-static .${PREFIX}-headline{
  filter:blur(0);
  opacity:1;
}

.${PREFIX}-subhead{
  margin:0 0 32px;
  max-width:40ch;
  font-size:16px;
  line-height:1.55;
  text-wrap:balance;
  color:var(--sig2-ink-soft);
  opacity:0;
}
.${PREFIX}-run .${PREFIX}-subhead{
  animation:${PREFIX}-soft-in calc(500ms * var(--sig2-speed))
    var(--sig2-ease-soft) both;
  animation-delay:calc(380ms * var(--sig2-speed));
}
.${PREFIX}-static .${PREFIX}-subhead{opacity:1;}

/* ---- Signal group ---- */
.${PREFIX}-signal-wrap{
  position:relative;
  max-width:100%;
  margin:0;
}
.${PREFIX}-signal-list{
  position:relative;
  list-style:none;
  margin:0;
  padding-left:22px;
  display:flex;
  flex-direction:column;
  gap:20px;
}
/* The focus plane — a single continuous 1px indigo hairline the lines
   register against (solid indigo, no gradient). */
.${PREFIX}-signal-list::before{
  content:"";
  position:absolute;
  left:0;
  top:.55em;
  bottom:.5em;
  width:1px;
  background:var(--sig2-indigo);
  transform:scaleY(1);
  transform-origin:top;
  opacity:1;
}
.${PREFIX}-run .${PREFIX}-signal-list::before{
  will-change:transform,opacity;
  animation:${PREFIX}-plane-draw calc(400ms * var(--sig2-speed))
    var(--sig2-ease-rack) both;
  animation-delay:calc(560ms * var(--sig2-speed));
}

.${PREFIX}-signal{
  display:grid;
  grid-template-columns:10px 1fr;
  align-items:start;
  gap:10px;
  text-align:left;
  /* Soft ghost first frame. */
  filter:blur(5px);
  opacity:.35;
  transform:scale(0.96);
  color:var(--sig2-ink-faint);
  transform-origin:left center;
}
.${PREFIX}-run .${PREFIX}-signal{
  will-change:filter,transform,opacity;
  animation:${PREFIX}-signal-focus calc(520ms * var(--sig2-speed))
    var(--sig2-ease-rack) both;
  animation-delay:var(--sig2-line-delay);
}
.${PREFIX}-static .${PREFIX}-signal{
  filter:blur(0);
  opacity:1;
  transform:scale(1);
  color:var(--sig2-ink);
}

.${PREFIX}-signal-text{
  font-size:19px;
  line-height:1.5;
  font-weight:500;
  letter-spacing:-0.012em;
  color:var(--sig2-ink);
}

/* Per-line registration tick where the line meets the plane. */
.${PREFIX}-marker{
  width:var(--sig2-tick-w,6px);
  height:1px;
  margin-top:.62em;
  background:var(--sig2-indigo);
  transform:scaleX(1);
  transform-origin:left center;
  opacity:1;
}
.${PREFIX}-run .${PREFIX}-marker{
  animation:${PREFIX}-mark-draw calc(160ms * var(--sig2-speed))
    var(--sig2-ease-rack) both;
  animation-delay:var(--sig2-mark-delay);
}
.${PREFIX}-static .${PREFIX}-marker{
  transform:scaleX(1);
  opacity:1;
}

/* ---- Autofocus confirm bracket (converge / lock / release) ---- */
.${PREFIX}-bracket{
  position:absolute;
  top:-14px;left:-14px;right:-14px;bottom:-14px;
  pointer-events:none;
  animation:${PREFIX}-bracket-life calc(720ms * var(--sig2-speed)) linear both;
  animation-delay:calc(1300ms * var(--sig2-speed));
}
.${PREFIX}-corner{
  position:absolute;
  width:16px;height:16px;
  opacity:0;
  animation:${PREFIX}-corner-lock calc(180ms * var(--sig2-speed))
    var(--sig2-ease-rack) both;
}
.${PREFIX}-corner-tl{top:0;left:0;border-top:1px solid var(--sig2-indigo);border-left:1px solid var(--sig2-indigo);}
.${PREFIX}-corner-tr{top:0;right:0;border-top:1px solid var(--sig2-indigo);border-right:1px solid var(--sig2-indigo);}
.${PREFIX}-corner-bl{bottom:0;left:0;border-bottom:1px solid var(--sig2-indigo);border-left:1px solid var(--sig2-indigo);}
.${PREFIX}-corner-br{bottom:0;right:0;border-bottom:1px solid var(--sig2-indigo);border-right:1px solid var(--sig2-indigo);}

/* ---- Microcopy ---- */
.${PREFIX}-microcopy{
  margin:32px 0 0;
  font-size:13px;
  letter-spacing:.01em;
  color:var(--sig2-ink-faint);
  opacity:0;
}
.${PREFIX}-run .${PREFIX}-microcopy{
  animation:${PREFIX}-soft-in calc(400ms * var(--sig2-speed))
    var(--sig2-ease-soft) both;
  animation-delay:calc(1520ms * var(--sig2-speed));
}
.${PREFIX}-static .${PREFIX}-microcopy{opacity:1;}

/* ---- At rest: drop performance hints ---- */
.${PREFIX}-rest .${PREFIX}-bokeh,
.${PREFIX}-rest .${PREFIX}-noise-inner,
.${PREFIX}-rest .${PREFIX}-headline,
.${PREFIX}-rest .${PREFIX}-signal,
.${PREFIX}-rest .${PREFIX}-marker,
.${PREFIX}-rest .${PREFIX}-signal-list::before{
  will-change:auto;
}

/* ---- Keyframes ---- */
@keyframes ${PREFIX}-headline-rack{
  from{filter:blur(6px);opacity:0;}
  to{filter:blur(0);opacity:1;}
}
@keyframes ${PREFIX}-soft-in{
  from{opacity:0;transform:translateY(4px);}
  to{opacity:1;transform:translateY(0);}
}
@keyframes ${PREFIX}-drift{
  from{transform:translate(-50%,-50%) translateX(0);}
  to{transform:translate(-50%,-50%) translateX(var(--sig2-dx));}
}
@keyframes ${PREFIX}-recede{
  0%{
    filter:blur(var(--sig2-field-blur));
    opacity:var(--sig2-op0);
    transform:translateY(0) scale(var(--sig2-sc0));
  }
  100%{
    filter:blur(var(--sig2-set-blur));
    opacity:var(--sig2-set-op);
    transform:translateY(var(--sig2-dy)) scale(var(--sig2-set-sc));
  }
}
@keyframes ${PREFIX}-bokeh-dilate{
  0%{transform:translate(-50%,-50%) scale(0.86);opacity:0;filter:blur(10px);}
  100%{transform:translate(-50%,-50%) scale(1.12);opacity:var(--sig2-bk-op);filter:blur(var(--sig2-bk-blur));}
}
@keyframes ${PREFIX}-signal-focus{
  0%{
    filter:blur(5px);
    opacity:.35;
    transform:scale(0.96);
    color:var(--sig2-ink-faint);
  }
  70%{
    filter:blur(0.4px);
    opacity:1;
    transform:scale(1.015);
    color:var(--sig2-ink);
  }
  100%{
    filter:blur(0);
    opacity:1;
    transform:scale(1);
    color:var(--sig2-ink);
  }
}
@keyframes ${PREFIX}-plane-draw{
  0%{opacity:0;transform:scaleY(0);}
  100%{opacity:1;transform:scaleY(1);}
}
@keyframes ${PREFIX}-mark-draw{
  0%{opacity:0;transform:scaleX(0);}
  100%{opacity:1;transform:scaleX(1);}
}
@keyframes ${PREFIX}-corner-lock{
  0%{opacity:0;transform:translate(var(--sig2-tx),var(--sig2-ty));}
  100%{opacity:1;transform:translate(0,0);}
}
@keyframes ${PREFIX}-bracket-life{
  0%{opacity:0;top:-14px;left:-14px;right:-14px;bottom:-14px;}
  18%{opacity:1;top:-14px;left:-14px;right:-14px;bottom:-14px;}
  40%{top:-14px;left:-14px;right:-14px;bottom:-14px;}
  52%{top:-13px;left:-13px;right:-13px;bottom:-13px;}
  65%{opacity:1;top:-13px;left:-13px;right:-13px;bottom:-13px;}
  100%{opacity:0;top:-13px;left:-13px;right:-13px;bottom:-13px;}
}

/* ---- Mobile ---- */
@media (max-width:430px){
  .${PREFIX}-hero-section{
    padding:48px 20px;
    --sig2-speed:0.85;
    --sig2-noise-stagger:48ms;
    --sig2-field-blur:5px;
  }
  .${PREFIX}-hide-mobile{display:none;}
  .${PREFIX}-noise{max-width:56vw;}
  .${PREFIX}-col{margin-left:max(4px, calc(50% - 480px));margin-right:8px;}
  .${PREFIX}-signal-list{padding-left:18px;}
  .${PREFIX}-signal-text{font-size:16px;line-height:1.5;}
}

/* ---- Reduced motion safety net ---- */
@media (prefers-reduced-motion: reduce){
  .${PREFIX}-hero-section *,
  .${PREFIX}-hero-section *::before,
  .${PREFIX}-hero-section{
    animation:none !important;
    transition:none !important;
  }
}
`;
