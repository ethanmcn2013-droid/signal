"use client";

import { useEffect, useState, type CSSProperties } from "react";

/**
 * Signal hero — "Morning Edition" (lens: editorial, polished).
 *
 * A newspaper front page starts full of grey column filler. In one calm
 * typesetting move the ink drains out of the noise, each filler line loses its
 * colour and collapses its own height, and the day's few real stories set
 * themselves. Each headline resolves via one identical left-to-right clip-path
 * compositor wipe, offset only in time. After the lead has finished setting, a
 * single 3px indigo blue-pencil marker — an editor's lede mark, the only stroke
 * of colour on an otherwise ink-on-paper page — is drawn in the left gutter.
 *
 * The rest state reads as a genuinely SET front page: a full-width lead across
 * the top with the pencil hanging in the margin, a baseline rule beneath it,
 * then two secondary decks filed side by side, split by a single hairline, each
 * with a mono kicker and a right-aligned tabular folio. Masthead is a folio
 * line under a double Oxford rule; the page closes on a matching rule above the
 * footnote tally. Three unambiguous tiers on an 8px baseline: a heavy sans lead,
 * a demoted motto tagline, and lighter ruled decks. Geist Sans headlines against
 * Geist Mono furniture — the sans/mono tension is the ownable editorial voice.
 *
 * Self-contained: no project imports except React. Everything is inline and
 * scoped with the `sig1` prefix so nothing leaks. In-flow only — no fixed
 * positioning, no inset:0, no escaping z-index. Choreography runs through CSS
 * keyframes with per-element delays, kicked off by a tracked rAF that is
 * cancelled on unmount. Under prefers-reduced-motion the whole intro
 * short-circuits to the settled front page with no timers scheduled, and every
 * piece of furniture is already in its final state (no first-frame flash).
 */

const PREFIX = "sig1";

// Allow CSS custom properties in inline style objects under strict TS.
type CSSVars = CSSProperties & { [key: `--${string}`]: string | number };

type Slot = {
  kind: "lead" | "deck";
  // Mono kicker label (plain noun) + tabular folio filed above the story.
  label: string;
  folio: string;
  signal: string;
  // Two grey filler paragraphs per slot. The first sentence of each is the
  // real noise line; the rest is quiet body copy so the measure justifies and
  // the page reads as an overfull wall of type at rest.
  noise: [string, string];
  // Zero-based document order of this slot's two filler lines (for stagger).
  noiseIndex: [number, number];
};

const SLOTS: Slot[] = [
  {
    kind: "lead",
    label: "SUPPLIERS",
    folio: "01",
    signal:
      "Claire’s wedding needs the supplier answer today or Friday’s print window slips.",
    noise: [
      "Two label tweaks landed yesterday. The change was cosmetic and merged into the shared board already, so there is nothing to decide and nobody is blocked on it.",
      "Printer quote changed by a small amount. It stays inside the range you approved last week, and the supplier kept the same delivery date on the order.",
    ],
    noiseIndex: [0, 1],
  },
  {
    kind: "deck",
    label: "INVOICES",
    folio: "02",
    signal:
      "Name the venue invoice owner before noon so the handoff does not stall.",
    noise: [
      "Backdrop samples arrived on time. They match the swatches from the last order, so the styling call can wait until the full set is unpacked and checked.",
      "Calendar import finished without action. Every event mapped cleanly onto an existing project and no duplicates were created during the overnight sync.",
    ],
    noiseIndex: [2, 3],
  },
  {
    kind: "deck",
    label: "CASE STUDY",
    folio: "03",
    signal: "Maeve’s case study is ready for one review pass.",
    noise: [
      "Three closed tasks came from admin cleanup. They were old reminders that no longer apply, cleared in a single pass to keep the working list honest.",
      "Checklist wording changed in one project. The edit was a small phrasing fix that does not move any dates or change who owns the step it sits on.",
    ],
    noiseIndex: [4, 5],
  },
];

const LEAD = SLOTS[0];
const DECKS = SLOTS.slice(1);

type Mode = "pre" | "animate" | "static";

export function SignalHeroSig1() {
  // "pre" holds the full noisy first frame until the effect decides how to run.
  const [mode, setMode] = useState<Mode>("pre");

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Reduced motion: render the settled front page instantly. No rAF, no
    // timers, no de-inking — the grey filler is simply absent and every rule,
    // kicker and marker is already in its final state.
    if (media.matches) {
      setMode("static");
      return;
    }

    const rafIds: number[] = [];

    // Kick the typesetting off after first paint so keyframes start clean from
    // the noisy first frame.
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setMode("animate"));
      rafIds.push(raf2);
    });
    rafIds.push(raf1);

    return () => {
      rafIds.forEach((id) => cancelAnimationFrame(id));
    };
  }, []);

  const running = mode === "animate";
  const isStatic = mode === "static";

  const sectionClass = [
    `${PREFIX}-hero-section`,
    running ? `${PREFIX}-run` : "",
    isStatic ? `${PREFIX}-static` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClass} style={ROOT_VARS}>
      <div className={`${PREFIX}-page`}>
        {/* Masthead: flag + folio flush left, dateline flush right. */}
        <header className={`${PREFIX}-masthead`}>
          <span className={`${PREFIX}-flagline`}>
            <span className={`${PREFIX}-flag`}>SIGNAL</span>
            <span className={`${PREFIX}-folio-mast`}>VOL. 1 · No. 04</span>
          </span>
          <span className={`${PREFIX}-dateline`}>FRIDAY · 4 JULY 2026</span>
        </header>

        {/* Double Oxford rule under the masthead. */}
        <div className={`${PREFIX}-rule`} aria-hidden="true" />

        {/* Product lockup — the paper's standing motto. */}
        <div className={`${PREFIX}-lockup`}>
          <h1 className={`${PREFIX}-headline`}>The signal, not the noise.</h1>
          <p className={`${PREFIX}-subhead`}>
            Every morning, Signal reads the pile and hands you the few things
            that need you. The rest is set aside, quietly.
          </p>
        </div>

        {/* Lead story — full width, pencil hanging in the gutter. */}
        <article className={`${PREFIX}-slot ${PREFIX}-slot-lead`}>
          <div className={`${PREFIX}-noise`} aria-hidden="true">
            <p
              className={`${PREFIX}-noise-line`}
              style={
                {
                  "--sig1-nl-delay": `calc(var(--sig1-noise-start) + ${LEAD.noiseIndex[0]} * var(--sig1-stagger))`,
                } as CSSVars
              }
            >
              {LEAD.noise[0]}
            </p>
            <p
              className={`${PREFIX}-noise-line ${PREFIX}-noise-second`}
              style={
                {
                  "--sig1-nl-delay": `calc(var(--sig1-noise-start) + ${LEAD.noiseIndex[1]} * var(--sig1-stagger))`,
                } as CSSVars
              }
            >
              {LEAD.noise[1]}
            </p>
          </div>

          <div className={`${PREFIX}-kicker`}>
            <span>{LEAD.label}</span>
            <span className={`${PREFIX}-folio`}>{LEAD.folio}</span>
          </div>

          <div className={`${PREFIX}-lead-wrap`}>
            <span className={`${PREFIX}-marker`} aria-hidden="true" />
            <h2 className={`${PREFIX}-signal ${PREFIX}-signal-lead`}>
              {LEAD.signal}
            </h2>
          </div>

          <div className={`${PREFIX}-baseline`} aria-hidden="true" />
        </article>

        {/* Two secondary decks, filed side by side and split by a hairline. */}
        <div className={`${PREFIX}-decks`}>
          {DECKS.map((slot, di) => (
            <article
              key={`deck-${di}`}
              className={`${PREFIX}-slot ${PREFIX}-slot-deck`}
              style={
                {
                  "--sig1-deck-delay": `calc(var(--sig1-deck-start) + ${di} * var(--sig1-deck-stagger))`,
                } as CSSVars
              }
            >
              <div className={`${PREFIX}-noise`} aria-hidden="true">
                <p
                  className={`${PREFIX}-noise-line`}
                  style={
                    {
                      "--sig1-nl-delay": `calc(var(--sig1-noise-start) + ${slot.noiseIndex[0]} * var(--sig1-stagger))`,
                    } as CSSVars
                  }
                >
                  {slot.noise[0]}
                </p>
                <p
                  className={`${PREFIX}-noise-line ${PREFIX}-noise-second`}
                  style={
                    {
                      "--sig1-nl-delay": `calc(var(--sig1-noise-start) + ${slot.noiseIndex[1]} * var(--sig1-stagger))`,
                    } as CSSVars
                  }
                >
                  {slot.noise[1]}
                </p>
              </div>

              <div className={`${PREFIX}-deck-rule`} aria-hidden="true" />

              <div className={`${PREFIX}-kicker`}>
                <span>{slot.label}</span>
                <span className={`${PREFIX}-folio`}>{slot.folio}</span>
              </div>

              <h3 className={`${PREFIX}-signal ${PREFIX}-signal-deck`}>
                {slot.signal}
              </h3>
            </article>
          ))}
        </div>

        {/* Footnote tally — closes the page under a matching rule. */}
        <p className={`${PREFIX}-footnote`}>
          Six quieter updates set aside for later.
        </p>
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const ROOT_VARS: CSSVars = {
  "--sig1-font": "var(--font-geist-sans, 'Geist', system-ui, sans-serif)",
  "--sig1-mono": "var(--font-geist-mono, monospace)",
  "--sig1-ink": "#111111",
  "--sig1-ink-soft": "#3f3f46",
  "--sig1-ink-faint": "#71717a",
  "--sig1-paper": "#ffffff",
  // Rule/hairline hierarchy: solid ink for the masthead top line + page close,
  // a light hairline for structural furniture, the faintest only for the outer
  // section border.
  "--sig1-rule": "#111111",
  "--sig1-hair": "rgba(17,17,17,.12)",
  "--sig1-hairline": "rgba(17,17,17,.06)",
  // The one accent — indigo, on the lead marker only.
  "--sig1-indigo": "#4f46e5",
  // Vertical rhythm.
  "--sig1-unit": "8px",
  // Mono micro-typography tracking.
  "--sig1-track-label": ".18em",
  "--sig1-track-mono": ".06em",
  // Motion tuning (overridden on mobile for a faster landing). The eye reads
  // lead -> pencil -> decks -> footnote.
  "--sig1-stagger": "45ms",
  "--sig1-noise-start": "320ms",
  "--sig1-noise-dur": "560ms",
  "--sig1-lead-at": "920ms",
  "--sig1-lead-dur": "620ms",
  "--sig1-marker-at": "1540ms",
  "--sig1-marker-dur": "380ms",
  "--sig1-deck-start": "1680ms",
  "--sig1-deck-stagger": "130ms",
  "--sig1-deck-dur": "560ms",
  "--sig1-foot-at": "2380ms",
};

const CSS = `
.${PREFIX}-hero-section{
  position:relative;
  box-sizing:border-box;
  min-height:clamp(520px, 62svh, 720px);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:clamp(28px,5vw,56px) clamp(24px,5vw,56px);
  background:var(--sig1-paper);
  border-bottom:1px solid var(--sig1-hairline);
  font-family:var(--sig1-font);
  color:var(--sig1-ink);
  -webkit-font-smoothing:antialiased;
  overflow:hidden;
}
.${PREFIX}-hero-section *{box-sizing:border-box;}

.${PREFIX}-page{
  width:min(760px,100%);
}

/* ---- Masthead: folio line ---- */
.${PREFIX}-masthead{
  display:flex;
  flex-wrap:wrap;
  justify-content:space-between;
  align-items:baseline;
  gap:6px 16px;
  font-family:var(--sig1-mono);
  font-size:11px;
  letter-spacing:var(--sig1-track-label);
  text-transform:uppercase;
  color:var(--sig1-ink-faint);
  opacity:0;
}
.${PREFIX}-run .${PREFIX}-masthead{
  animation:${PREFIX}-fade 400ms cubic-bezier(0.22,0.61,0.36,1) 120ms both;
}
.${PREFIX}-static .${PREFIX}-masthead{opacity:1;}
.${PREFIX}-flagline{
  display:inline-flex;
  align-items:baseline;
  gap:12px;
}
.${PREFIX}-flag{
  font-weight:600;
  color:var(--sig1-ink);
}
.${PREFIX}-folio-mast{
  color:var(--sig1-ink-faint);
  font-variant-numeric:tabular-nums;
}
.${PREFIX}-dateline{
  color:var(--sig1-ink-soft);
  font-variant-numeric:tabular-nums;
  white-space:nowrap;
}

/* ---- Double Oxford rule ---- */
.${PREFIX}-rule{
  position:relative;
  height:3px;
  margin-top:var(--sig1-unit);
}
.${PREFIX}-rule::before{
  content:"";
  position:absolute;
  left:0;
  right:0;
  top:0;
  height:1px;
  background:var(--sig1-rule);
  transform:scaleX(0);
  transform-origin:left center;
}
.${PREFIX}-rule::after{
  content:"";
  position:absolute;
  left:0;
  right:0;
  top:2px;
  height:1px;
  background:var(--sig1-hair);
}
.${PREFIX}-run .${PREFIX}-rule::before{
  animation:${PREFIX}-draw 420ms cubic-bezier(0.22,0.61,0.36,1) 120ms both;
}
.${PREFIX}-static .${PREFIX}-rule::before{transform:scaleX(1);}

/* ---- Product lockup ---- */
.${PREFIX}-lockup{
  margin-top:calc(var(--sig1-unit) * 3);
  opacity:0;
}
.${PREFIX}-run .${PREFIX}-lockup{
  animation:${PREFIX}-fade 460ms cubic-bezier(0.22,0.61,0.36,1) 180ms both;
}
.${PREFIX}-static .${PREFIX}-lockup{opacity:1;}
.${PREFIX}-headline{
  margin:0;
  font-size:clamp(20px,2.6vw,24px);
  line-height:1.15;
  font-weight:560;
  letter-spacing:-0.01em;
  color:var(--sig1-ink-soft);
}
.${PREFIX}-subhead{
  margin:var(--sig1-unit) 0 0;
  max-width:52ch;
  font-size:clamp(14px,1.7vw,15px);
  line-height:1.5;
  color:var(--sig1-ink-soft);
}

/* ---- Slots ---- */
.${PREFIX}-slot{position:relative;}
.${PREFIX}-slot-lead{margin-top:calc(var(--sig1-unit) * 5);}

/* Grey filler that de-inks then collapses */
.${PREFIX}-noise{overflow:hidden;}
.${PREFIX}-noise-line{
  margin:0 0 var(--sig1-unit);
  max-height:150px;
  font-size:11px;
  line-height:1.5;
  letter-spacing:0.02em;
  text-align:justify;
  hyphens:auto;
  color:var(--sig1-ink-faint);
}
.${PREFIX}-noise-line:last-child{margin-bottom:0;}
.${PREFIX}-run .${PREFIX}-noise-line{
  will-change:max-height,color,letter-spacing;
  animation:${PREFIX}-deink var(--sig1-noise-dur) cubic-bezier(0.6,0,0.2,1) both;
  animation-delay:var(--sig1-nl-delay);
}
.${PREFIX}-static .${PREFIX}-noise{display:none;}

/* Kicker row: mono label flush-left, tabular folio flush-right */
.${PREFIX}-kicker{
  display:flex;
  justify-content:space-between;
  align-items:baseline;
  margin:0 0 10px;
  font-family:var(--sig1-mono);
  font-size:10px;
  letter-spacing:var(--sig1-track-label);
  text-transform:uppercase;
  color:var(--sig1-ink-faint);
  opacity:0;
}
.${PREFIX}-folio{font-variant-numeric:tabular-nums;}
.${PREFIX}-run .${PREFIX}-slot-lead .${PREFIX}-kicker{
  animation:${PREFIX}-fade 340ms cubic-bezier(0.22,0.61,0.36,1)
    calc(var(--sig1-lead-at) - 120ms) both;
}
.${PREFIX}-run .${PREFIX}-slot-deck .${PREFIX}-kicker{
  animation:${PREFIX}-fade 340ms cubic-bezier(0.22,0.61,0.36,1)
    calc(var(--sig1-deck-delay) - 120ms) both;
}
.${PREFIX}-static .${PREFIX}-kicker{opacity:1;}

/* Per-deck top rule, drawn on the deck's own delay */
.${PREFIX}-deck-rule{
  height:1px;
  margin-bottom:14px;
  background:var(--sig1-hair);
  transform:scaleX(0);
  transform-origin:left center;
}
.${PREFIX}-run .${PREFIX}-deck-rule{
  animation:${PREFIX}-draw 400ms cubic-bezier(0.16,1,0.3,1)
    calc(var(--sig1-deck-delay) - 120ms) both;
}
.${PREFIX}-static .${PREFIX}-deck-rule{transform:scaleX(1);}

/* Signal headlines: collapsed + clipped until set, then one identical wipe */
.${PREFIX}-signal{
  margin:0;
  max-height:0;
  overflow:hidden;
  color:var(--sig1-ink);
  clip-path:inset(0 100% 0 0);
}
.${PREFIX}-signal-lead{
  font-size:clamp(28px,4.4vw,40px);
  font-weight:680;
  letter-spacing:-0.028em;
  line-height:1.05;
  text-wrap:balance;
  max-width:20ch;
}
.${PREFIX}-signal-deck{
  font-size:clamp(17px,2vw,20px);
  font-weight:600;
  letter-spacing:-0.014em;
  line-height:1.4;
  text-wrap:pretty;
  max-width:40ch;
}
.${PREFIX}-run .${PREFIX}-signal-lead{
  will-change:max-height,clip-path;
  animation:${PREFIX}-wipe var(--sig1-lead-dur) cubic-bezier(0.16,1,0.3,1)
    var(--sig1-lead-at) both;
}
.${PREFIX}-run .${PREFIX}-signal-deck{
  will-change:max-height,clip-path;
  animation:${PREFIX}-wipe var(--sig1-deck-dur) cubic-bezier(0.16,1,0.3,1)
    var(--sig1-deck-delay) both;
}
.${PREFIX}-static .${PREFIX}-signal{
  max-height:none;
  clip-path:inset(0 0 0 0);
}

/* Lead wrap: text starts at x=0, only the indigo pencil lives in the margin */
.${PREFIX}-lead-wrap{
  position:relative;
  padding-left:0;
}
.${PREFIX}-marker{
  position:absolute;
  left:-24px;
  top:0;
  bottom:0;
  width:3px;
  background:var(--sig1-indigo);
  transform:scaleY(0);
  transform-origin:top;
}
.${PREFIX}-run .${PREFIX}-marker{
  animation:${PREFIX}-grow var(--sig1-marker-dur) cubic-bezier(0.7,0,0.3,1)
    var(--sig1-marker-at) both;
}
.${PREFIX}-static .${PREFIX}-marker{transform:scaleY(1);}

/* Baseline rule under the lead */
.${PREFIX}-baseline{
  height:1px;
  margin-top:calc(var(--sig1-unit) * 2);
  background:var(--sig1-hair);
  transform:scaleX(0);
  transform-origin:left center;
}
.${PREFIX}-run .${PREFIX}-baseline{
  animation:${PREFIX}-draw var(--sig1-lead-dur) cubic-bezier(0.16,1,0.3,1)
    var(--sig1-lead-at) both;
}
.${PREFIX}-static .${PREFIX}-baseline{transform:scaleX(1);}

/* ---- Two-column deck filing ---- */
.${PREFIX}-decks{
  margin-top:calc(var(--sig1-unit) * 3.5);
  display:grid;
  grid-template-columns:1fr 1fr;
  column-gap:clamp(28px,4vw,48px);
}
.${PREFIX}-decks > .${PREFIX}-slot-deck:last-child{
  padding-left:clamp(28px,4vw,48px);
  border-left:1px solid var(--sig1-hair);
}

/* ---- Footnote tally: closes the page under a matching rule ---- */
.${PREFIX}-footnote{
  margin:calc(var(--sig1-unit) * 4) 0 0;
  border-top:1px solid var(--sig1-rule);
  padding-top:calc(var(--sig1-unit) * 2);
  font-family:var(--sig1-mono);
  font-size:11px;
  letter-spacing:var(--sig1-track-mono);
  color:var(--sig1-ink-faint);
  font-variant-numeric:tabular-nums;
  opacity:0;
}
.${PREFIX}-run .${PREFIX}-footnote{
  animation:${PREFIX}-fade 340ms cubic-bezier(0.22,0.61,0.36,1)
    var(--sig1-foot-at) both;
}
.${PREFIX}-static .${PREFIX}-footnote{opacity:1;}

/* ---- Keyframes ---- */
@keyframes ${PREFIX}-fade{
  from{opacity:0;transform:translateY(3px);}
  to{opacity:1;transform:translateY(0);}
}
@keyframes ${PREFIX}-draw{
  from{transform:scaleX(0);}
  to{transform:scaleX(1);}
}
@keyframes ${PREFIX}-grow{
  from{transform:scaleY(0);}
  to{transform:scaleY(1);}
}
/* De-ink: colour drains first, then the block physically collapses like set
   metal. Two-phase — ink out by 40%, paper closes 40->100. */
@keyframes ${PREFIX}-deink{
  0%{
    max-height:150px;
    margin-bottom:var(--sig1-unit);
    color:var(--sig1-ink-faint);
    letter-spacing:0.02em;
    opacity:1;
  }
  40%{
    max-height:150px;
    margin-bottom:var(--sig1-unit);
    color:rgba(113,113,122,0);
    letter-spacing:0.02em;
    opacity:0;
  }
  100%{
    max-height:0;
    margin-bottom:0;
    color:rgba(113,113,122,0);
    letter-spacing:-0.04em;
    opacity:0;
  }
}
/* One pure left-to-right compositor wipe, shared by all three headlines. */
@keyframes ${PREFIX}-wipe{
  from{clip-path:inset(0 100% 0 0);max-height:0;}
  to{clip-path:inset(0 0 0 0);max-height:600px;}
}

/* ---- Mobile (~430px): single filler line per slot, ~0.7x timing ---- */
@media (max-width:430px){
  .${PREFIX}-page{
    --sig1-stagger:30ms;
    --sig1-noise-start:224ms;
    --sig1-noise-dur:392ms;
    --sig1-lead-at:644ms;
    --sig1-lead-dur:434ms;
    --sig1-marker-at:1080ms;
    --sig1-marker-dur:260ms;
    --sig1-deck-start:1180ms;
    --sig1-deck-stagger:90ms;
    --sig1-deck-dur:400ms;
    --sig1-foot-at:1680ms;
  }
  .${PREFIX}-hero-section{
    padding:clamp(28px,5vw,56px) clamp(16px,5vw,56px);
  }
  .${PREFIX}-marker{left:-16px;}
  .${PREFIX}-noise-second{display:none;}
  /* Re-tighten the stagger for the three remaining filler lines (0,2,4). */
  .${PREFIX}-slot-deck:nth-of-type(1) .${PREFIX}-noise-line{
    animation-delay:calc(var(--sig1-noise-start) + 1 * var(--sig1-stagger));
  }
  .${PREFIX}-slot-deck:nth-of-type(2) .${PREFIX}-noise-line{
    animation-delay:calc(var(--sig1-noise-start) + 2 * var(--sig1-stagger));
  }
}

/* ---- Two-column collapse: stack decks below 560px ---- */
@media (max-width:560px){
  .${PREFIX}-decks{
    grid-template-columns:1fr;
    column-gap:0;
    row-gap:24px;
  }
  .${PREFIX}-decks > .${PREFIX}-slot-deck:last-child{
    padding-left:0;
    border-left:none;
  }
}

/* ---- Reduced-motion safety net ----
   Force the settled front page regardless of JS mode, so the final signal
   state shows instantly with no intro and no first-frame flash of hidden
   furniture (kickers, folios, per-deck rules, Oxford rule, closing rule). */
@media (prefers-reduced-motion: reduce){
  .${PREFIX}-hero-section *,
  .${PREFIX}-hero-section *::before,
  .${PREFIX}-hero-section *::after,
  .${PREFIX}-hero-section{
    animation:none !important;
    transition:none !important;
  }
  .${PREFIX}-masthead,
  .${PREFIX}-lockup,
  .${PREFIX}-kicker,
  .${PREFIX}-footnote{opacity:1 !important;}
  .${PREFIX}-rule::before,
  .${PREFIX}-deck-rule,
  .${PREFIX}-baseline{transform:scaleX(1) !important;}
  .${PREFIX}-marker{transform:scaleY(1) !important;}
  .${PREFIX}-signal{
    max-height:none !important;
    clip-path:inset(0 0 0 0) !important;
  }
  .${PREFIX}-noise{display:none !important;}
}
`;
