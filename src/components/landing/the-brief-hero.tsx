"use client";

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { formatFrozenDateline } from "@/lib/frozen-dateline";

/**
 * Signal homepage opener — "The Brief."
 *
 * The old opener began in medias res: a packed pile of noise was already on
 * screen, got read and sorted, and resolved into a front page. It demonstrated
 * the *behaviour* beautifully but never stated the *intent* — a first-time
 * visitor watched something happen without being told why it mattered. This
 * version keeps every frame of that distillation and puts a short spoken idea
 * in front of it, so the motion becomes the proof of a sentence you have
 * already read rather than a clever animation you have to decode.
 *
 * The shape is Apple's: idea → philosophy → demonstration → clarity.
 *
 *   ACT I  — THE OVERTURE (words, no interface). A near-blank page carrying
 *            only the masthead. Three plain lines arrive and leave, one at a
 *            time, each alone in the centre:
 *              1. the reality      "Every day, more arrives than you can read."
 *              2. the reframe       "Most of it doesn't need you."
 *              3. the philosophy    "Turn chaos into signal."
 *            On the third line the word *chaos* is the seed: it blooms open and
 *            scatters, and out of it the pile materialises. The idea hands off
 *            into the mechanism — the animation is now the sentence made true.
 *
 *   ACT II — THE MECHANISM (the product doing its job) — UNCHANGED:
 *     A READ    — one 1px indigo line sweeps top to bottom; each row ticks faint
 *                 indigo as it is read.
 *     B SELECT  — three chips gain a persistent indigo marker and lift; every other
 *                 chip dims and desaturates.
 *     C CLEAR   — the dimmed noise collapses away in a top-to-bottom wave, scaling
 *                 down and drifting aside, opening whitespace.
 *     D PROMOTE — the three survivors hand off to the front-page headlines with a
 *                 position-independent cross-dissolve while the real headlines set
 *                 via a left-to-right clip wipe, kickers and rules draw in, the
 *                 indigo pencil grows, and the standfirst band fades in.
 *
 *   ACT III — REST / CLARITY. "The Morning Spread": an asymmetric editorial
 *            front page. A masthead + double Oxford rule, a standfirst band whose
 *            headline — "Three things need you today." — is the payoff, concrete
 *            now that you have watched the mechanism find them, a dominant
 *            lead column beside a filed rail carrying stories 02/03 over a SET
 *            ASIDE index, one honest ledger line, then a restrained CTA row.
 *            Everything hangs to one left optical edge; the only colour is the
 *            indigo editor's pencil in the lead gutter.
 *
 * SSR-SETTLED + PLAY-ONCE: the component's initial React state is the SETTLED
 * broadsheet — real semantic headings, no overture, no noise field. So server
 * render === first client render === settled (no hydration mismatch, works with
 * no JS, good for SEO / accessibility / reduced motion). An isomorphic layout
 * effect then steps the stage forward exactly once BEFORE first paint when
 * motion is allowed (idle → overture → mechanism → rest), so the first painted
 * frame is the quiet overture page, never the settled spread. Under
 * prefers-reduced-motion the stage never advances and the settled render stays.
 *
 * Self-contained: no project imports except React. Everything is inline and
 * scoped with the `sig5` prefix. In-flow only for the spread; the overture and
 * note field are position:absolute *within the page column*, aria-hidden, and
 * never displace layout. Motion runs through CSS keyframes kicked off once by
 * the layout effect; every timer is tracked and cleared on unmount.
 */

const PREFIX = "sig5";

// Allow CSS custom properties in inline style objects under strict TS.
type CSSVars = CSSProperties & { [key: `--${string}`]: string | number };

// Run the reveal before first paint on the client, but fall back to a passive
// effect during SSR so React does not warn about useLayoutEffect on the server.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Chip = {
  text: string;
  meta?: string;
  signal?: boolean; // one of the three that becomes a headline
  mob?: boolean; // hidden on narrow screens to keep the mosaic legible
};

// Roughly forty short fragments of everyday wedding / venue / small-business
// noise. Three are secretly the signal ones and carry a kicker as their meta.
const CHIPS: Chip[] = [
  { text: "Two label tweaks landed", meta: "8:41" },
  { text: "Printer quote changed", mob: true },
  { text: "Calendar import finished", meta: "SYNC" },
  { text: "Backdrop samples arrived" },
  { text: "Guest count synced", meta: "9:02" },
  { text: "Supplier answer is still open", meta: "SUPPLIERS", signal: true },
  { text: "Tasting menu draft saved", mob: true },
  { text: "Floor plan renamed", mob: true },
  { text: "Two comments resolved", meta: "2m" },
  { text: "Seating note added", mob: true },
  { text: "Signage proof approved" },
  { text: "Shuttle time penciled", meta: "9:20", mob: true },
  { text: "Playlist shared to venue", mob: true },
  { text: "RSVP form edited" },
  { text: "Deposit reminder snoozed", meta: "1d" },
  { text: "Timeline PDF exported", mob: true },
  { text: "Vendor added to contacts", mob: true },
  { text: "Rehearsal slot moved", meta: "8:55" },
  { text: "Lighting list reordered", mob: true },
  { text: "Florist invoice viewed" },
  { text: "Venue invoice needs an owner", meta: "INVOICES", signal: true },
  { text: "Coat check noted", mob: true },
  { text: "Napkin colour picked" },
  { text: "Cake tasting booked", meta: "9:08" },
  { text: "Parking map updated", mob: true },
  { text: "Table numbers drafted", mob: true },
  { text: "Welcome sign checked" },
  { text: "Gift list link fixed", meta: "3m", mob: true },
  { text: "Menu allergens flagged" },
  { text: "Chair count confirmed", mob: true },
  { text: "Ceremony music shortlisted" },
  { text: "Photo shot list started", meta: "8:33", mob: true },
  { text: "Thank-you cards ordered", mob: true },
  { text: "Maeve’s case study is ready to review", meta: "CASE STUDY", signal: true },
  { text: "Dance floor size checked", mob: true },
  { text: "Bar package compared" },
  { text: "Weather forecast saved", meta: "9:11", mob: true },
  { text: "Hotel block extended", mob: true },
  { text: "Ring bearer confirmed" },
  { text: "Toast order sketched", mob: true },
  { text: "Linen swatch returned", meta: "4m" },
  { text: "Aisle runner measured", mob: true },
  { text: "Favour tags printed", mob: true },
  { text: "Cutlery count logged", meta: "9:15" },
];

// Desktop mosaic columns — used to derive a stable vertical position per chip so
// the read sweep and the clearing wave stagger cleanly top to bottom.
const COLS = 4;
const MAX_ROW = Math.max(1, Math.ceil(CHIPS.length / COLS) - 1);

type Deck = { label: string; folio: string; chip: string; signal: string };

// The lead: full concrete WHAT + WHY sentence, solid-ink urgency chip.
const LEAD = {
  label: "SUPPLIERS",
  folio: "01",
  chip: "DUE TODAY",
  signal:
    "The supplier answer is due today. Wait, and Friday’s print window closes.",
};

// The rail: two filed stories with outline chips.
const DECKS: Deck[] = [
  {
    label: "INVOICES",
    folio: "02",
    chip: "BY NOON",
    signal: "The venue invoice has no owner. Name one before noon or the handoff stalls.",
  },
  {
    label: "CASE STUDY",
    folio: "03",
    chip: "READY",
    signal: "Maeve’s case study has been waiting. One look is all it needs.",
  },
];

// Three real samples of the quieted pile, kept on screen so the 44/41 tally is
// earned, not asserted. 3 shown + 38 more = 41 set aside.
const ASIDE: { what: string; time: string }[] = [
  { what: "Guest count synced", time: "9:02" },
  { what: "Rehearsal slot moved", time: "8:55" },
  { what: "Deposit reminder snoozed", time: "1d" },
];

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// The stages of the opener. `idle` is the SSR-settled spread; the layout effect
// advances idle → overture → mechanism → rest exactly once when motion is
// allowed. Kept as a string union (not two booleans) so the three motion phases
// are mutually exclusive by construction.
type Stage = "idle" | "overture" | "mechanism" | "rest";

// How long the spoken overture holds before the pile materialises, and how long
// the mechanism runs before we drop performance hints. OVERTURE_MS must stay in
// step with the --sig5-ov-* timings in ROOT_VARS (the seed word begins to bloom
// just before this, so the pile emerges out of it rather than after it). The
// overture is paced unhurried on purpose — each line gets room to be read once
// and land before the next arrives.
const OVERTURE_MS = 7000;
const MECHANISM_MS = 3200;

export function TheBriefHero() {
  // Initial state is the SETTLED broadsheet, so server render === first client
  // render. The layout effect below steps the stage forward before first paint
  // when motion is allowed.
  const [stage, setStage] = useState<Stage>("idle");

  // Play-once guard + tracked timers for clean unmount.
  const startedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useIsoLayoutEffect(() => {
    // Only ever start the sequence once per mount.
    if (startedRef.current) return;
    if (typeof window === "undefined") return;

    // Reduced motion (or no matchMedia): stay on the settled render. No
    // overture, no field, no motion, no delay.
    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (prefersReduced) return;

    startedRef.current = true;

    // Because this runs inside a layout effect, React re-renders and commits the
    // overture state before the browser paints — the first painted frame is the
    // quiet overture page, never the settled spread. No flash of the rest state.
    setStage("overture");

    const timers = timersRef.current;
    // The idea speaks, then hands off into the pile; the mechanism lands ~2.4s
    // after that. Strip hints and stop the idle drift shortly after so low-end
    // devices are not left holding will-change.
    timers.push(setTimeout(() => setStage("mechanism"), OVERTURE_MS));
    timers.push(
      setTimeout(() => setStage("rest"), OVERTURE_MS + MECHANISM_MS),
    );

    return () => {
      timers.forEach((id) => clearTimeout(id));
      timers.length = 0;
    };
  }, []);

  const isOverture = stage === "overture";
  const running = stage === "mechanism" || stage === "rest";
  const showField = running;
  // The overture layer is mounted through the mechanism's opening frames so the
  // seed word can cross-dissolve into the pile rather than cutting to it.
  const showOverture = isOverture || stage === "mechanism";

  const sectionClass = [
    `${PREFIX}-hero-section`,
    running ? `${PREFIX}-run` : "",
    stage === "idle" ? `${PREFIX}-static` : "",
    isOverture ? `${PREFIX}-overture` : "",
    stage === "rest" ? `${PREFIX}-rest` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClass} style={ROOT_VARS}>
      {/* The front page — one editorial spread. */}
      <div className={`${PREFIX}-page`}>
        {/* The overture — the idea, spoken before any interface. Decorative and
            aria-hidden: the settled headings below carry the same message for
            assistive tech and no-JS. Mounted through the mechanism's opening
            frames so the seed word can dissolve into the pile. */}
        {showOverture && (
          <div className={`${PREFIX}-overture-layer`} aria-hidden="true">
            <p className={`${PREFIX}-ov-line ${PREFIX}-ov-1`}>
              Every day, more arrives than you can read.
            </p>
            <p className={`${PREFIX}-ov-line ${PREFIX}-ov-2`}>
              Most of it doesn’t need you.
            </p>
            <p className={`${PREFIX}-ov-line ${PREFIX}-ov-3`}>
              Turn <span className={`${PREFIX}-ov-seed`}>chaos</span> into
              signal.
            </p>
          </div>
        )}

        {/* Decorative note field — the packed pile. Only mounted once the idea
            has handed off; aria-hidden and below the real content. */}
        {showField && (
          <div className={`${PREFIX}-noise-field`} aria-hidden="true">
            <span className={`${PREFIX}-sweep`} />
            {CHIPS.map((c, i) => {
              const row = Math.floor(i / COLS);
              const vy = row / MAX_ROW;
              const chipClass = [
                `${PREFIX}-chip`,
                c.signal ? `${PREFIX}-chip-signal` : "",
                c.mob ? `${PREFIX}-hide-mobile` : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <div
                  key={`chip-${i}`}
                  className={chipClass}
                  style={{ "--sig5-vy": Number(vy.toFixed(3)), "--sig5-di": i } as CSSVars}
                >
                  <div className={`${PREFIX}-drift`}>
                    <div
                      className={`${PREFIX}-note${c.signal ? ` ${PREFIX}-note-signal` : ""}`}
                    >
                      {c.signal && <span className={`${PREFIX}-note-mark`} />}
                      <span className={`${PREFIX}-note-text`}>{c.text}</span>
                      {c.meta && <span className={`${PREFIX}-note-meta`}>{c.meta}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Masthead: flag + folio flush left, two-line dateline flush right. */}
        <header className={`${PREFIX}-masthead`}>
          <span className={`${PREFIX}-flagline`}>
            <span className={`${PREFIX}-flag`}>SIGNAL</span>
            <span className={`${PREFIX}-folio-mast`}>VOL. 1 · No. 04</span>
          </span>
          <span className={`${PREFIX}-datestack`}>
            <span className={`${PREFIX}-dateline`}>
              {formatFrozenDateline("2026-07-04")}
            </span>
            <span className={`${PREFIX}-dateline-sub`}>
              FROZEN EXAMPLE · COMPILED 8:42
            </span>
          </span>
        </header>

        {/* Double Oxford rule under the masthead — part of the crisp anchor. */}
        <div className={`${PREFIX}-rule`} aria-hidden="true" />

        {/* Standfirst band — promise flush left, subhead flush right on baseline. */}
        <div className={`${PREFIX}-standfirst-band`}>
          <h1 className={`${PREFIX}-standfirst`}>Three things won&rsquo;t wait.</h1>
        </div>

        {/* Drawn hairline — separates the promise from the day. */}
        <div className={`${PREFIX}-band-rule`} aria-hidden="true" />

        {/* Body: dominant lead column beside a narrower filed rail. */}
        <div className={`${PREFIX}-body`}>
          {/* Lead story — indigo pencil hanging in the gutter. */}
          <article className={`${PREFIX}-lead`}>
            <div className={`${PREFIX}-kicker`}>
              <span className={`${PREFIX}-kgroup`}>
                <span>{LEAD.label}</span>
                <span className={`${PREFIX}-kdot`} aria-hidden="true">
                  ·
                </span>
                <span className={`${PREFIX}-folio`}>{LEAD.folio}</span>
              </span>
              <span className={`${PREFIX}-tag ${PREFIX}-tag-solid`}>{LEAD.chip}</span>
            </div>

            <div className={`${PREFIX}-lead-wrap`}>
              <span className={`${PREFIX}-marker`} aria-hidden="true" />
              <h2 className={`${PREFIX}-signal ${PREFIX}-signal-lead`}>{LEAD.signal}</h2>
              <p className={`${PREFIX}-lead-dek`}>Waiting on the final guest count.</p>
            </div>
          </article>

          {/* Filed rail — stories 02/03 over the SET ASIDE index. */}
          <div className={`${PREFIX}-rail`}>
            <div className={`${PREFIX}-rail-label`}>ALSO TODAY</div>

            {DECKS.map((slot, di) => {
              const delay = `calc(var(--sig5-deck-start) + ${di} * var(--sig5-deck-stagger))`;
              return (
                <Fragment key={`deck-${di}`}>
                  {di > 0 && (
                    <div
                      className={`${PREFIX}-deck-rule`}
                      aria-hidden="true"
                      style={{ "--sig5-deck-delay": delay } as CSSVars}
                    />
                  )}
                  <article
                    className={`${PREFIX}-deck`}
                    style={{ "--sig5-deck-delay": delay } as CSSVars}
                  >
                    <div className={`${PREFIX}-kicker`}>
                      <span className={`${PREFIX}-kgroup`}>
                        <span>{slot.label}</span>
                        <span className={`${PREFIX}-kdot`} aria-hidden="true">
                          ·
                        </span>
                        <span className={`${PREFIX}-folio`}>{slot.folio}</span>
                      </span>
                      <span className={`${PREFIX}-tag ${PREFIX}-tag-outline`}>
                        {slot.chip}
                      </span>
                    </div>
                    <h3 className={`${PREFIX}-signal ${PREFIX}-signal-deck`}>
                      {slot.signal}
                    </h3>
                  </article>
                </Fragment>
              );
            })}

            <div
              className={`${PREFIX}-deck-rule`}
              aria-hidden="true"
              style={
                {
                  "--sig5-deck-delay":
                    "calc(var(--sig5-deck-start) + 2 * var(--sig5-deck-stagger))",
                } as CSSVars
              }
            />

            {/* SET ASIDE index — a concrete sample of the quieted pile. */}
            <div className={`${PREFIX}-aside`}>
              <div className={`${PREFIX}-aside-label`}>SET ASIDE</div>
              {ASIDE.map((a, ai) => (
                <p key={`aside-${ai}`} className={`${PREFIX}-aside-line`}>
                  <span className={`${PREFIX}-aside-what`}>{a.what}</span>
                  <span className={`${PREFIX}-aside-dot`} aria-hidden="true">
                    {" "}
                    ·{" "}
                  </span>
                  <span className={`${PREFIX}-aside-time`}>{a.time}</span>
                </p>
              ))}
              <p className={`${PREFIX}-aside-more`}>+ 38 more</p>
            </div>
          </div>
        </div>

        {/* Closing ledger — honest tally flush left, sample note flush right. */}
        <div className={`${PREFIX}-ledger`}>
          <p className={`${PREFIX}-tally`}>
            Signal read <span className={`${PREFIX}-num`}>44</span> updates this morning.{" "}
            <span className={`${PREFIX}-num`}>41</span> could wait. These{" "}
            <span className={`${PREFIX}-three`}>three</span>{" "}couldn&rsquo;t.
          </p>
        </div>

        {/* CTA row — reveals last with the ledger, present at rest. */}
        <div className={`${PREFIX}-cta`}>
          <a
            className={`${PREFIX}-cta-primary`}
            href="https://signalstudio.ie/waitlist?source=home_hero&product=signal"
          >
            Request access
          </a>
          <a className={`${PREFIX}-cta-secondary`} href="/wedding-planning">
            Read a sample briefing
          </a>
        </div>
      </div>

      {/* Quiet scroll cue near the bottom of the viewport. */}
      <div className={`${PREFIX}-scrollcue`} aria-hidden="true">
        <span className={`${PREFIX}-chevron`} />
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const ROOT_VARS: CSSVars = {
  "--sig5-font": "var(--font-geist-sans, 'Geist', system-ui, sans-serif)",
  "--sig5-mono": "var(--font-geist-mono, monospace)",
  // Palette points at the Design System tokens (no raw hex, so the DS drift gate
  // stays clean and the hero inherits the live theme, dark mode included).
  "--sig5-ink": "var(--ink)",
  "--sig5-ink-soft": "var(--ink-soft)",
  "--sig5-ink-faint": "var(--ink-faint)",
  "--sig5-paper": "var(--paper)",
  // Rule hierarchy: solid ink for the masthead top line + page close, a light
  // hairline for structural furniture, the faintest only for the section border.
  "--sig5-rule": "var(--ink)",
  "--sig5-hair": "rgba(17,17,17,.12)",
  "--sig5-hairline": "var(--border, rgba(17,17,17,.06))",
  // The one accent, indigo, on the read sweep, the markers, and the lead pencil.
  "--sig5-indigo": "var(--accent)",
  "--sig5-indigo-soft": "rgba(79,70,229,.10)",
  // Bespoke motion curves for the noise-to-signal choreography (settle, fade,
  // draw, pencil). ds-allow: hero motion, not reusable UI transitions.
  "--sig5-ease-rack": "cubic-bezier(0.22,0.61,0.18,1)", // ds-allow: hero motion choreography
  "--sig5-ease-soft": "cubic-bezier(0.16,1,0.3,1)", // ds-allow: hero motion choreography
  "--sig5-ease-draw": "cubic-bezier(0.22,0.61,0.36,1)", // ds-allow: hero motion choreography
  "--sig5-ease-pencil": "cubic-bezier(0.7,0,0.3,1)", // ds-allow: hero motion choreography
  // Vertical rhythm + mono tracking.
  "--sig5-unit": "8px",
  "--sig5-track-label": ".18em",
  "--sig5-track-mono": ".06em",
  // Where the mosaic starts, just under the now two-line masthead.
  "--sig5-field-top": "44px",
  // The overture (Act I). Each line arrives, is held long enough to read once,
  // and leaves before the next — one thought alone at a time. The third line
  // holds while its seed word ("chaos") blooms open, and the pile emerges out of
  // that bloom. Keep the last beat (seed-at + its duration) in step with
  // OVERTURE_MS so the hand-off is seamless rather than a cut.
  "--sig5-ov-dur": "2400ms", // on-screen life of lines 1 & 2 (in, hold, out)
  "--sig5-ov-l1-at": "250ms",
  "--sig5-ov-l2-at": "2800ms",
  "--sig5-ov-l3-at": "5400ms",
  "--sig5-ov-l3-dur": "1300ms", // line 3 sets and then holds (no scheduled out)
  "--sig5-ov-seed-at": "6800ms", // the word chaos begins to scatter into the pile
  "--sig5-ov-seed-dur": "1000ms",
  "--sig5-ov-out-dur": "460ms", // the whole overture dissolves as the pile arrives
  // Motion tuning. Eye reads: sweep -> select three -> clear the pile -> the
  // three promote into headlines -> set aside index + ledger.
  "--sig5-sweep-dur": "720ms",
  "--sig5-sweep-span": "460ms",
  "--sig5-tick-dur": "380ms",
  "--sig5-select-at": "560ms",
  "--sig5-select-dur": "440ms",
  "--sig5-clear-at": "1050ms",
  "--sig5-clear-span": "560ms",
  "--sig5-clear-dur": "560ms",
  "--sig5-promote-at": "1580ms",
  "--sig5-promote-dur": "660ms",
  "--sig5-standfirst-at": "1500ms",
  "--sig5-lead-at": "1620ms",
  "--sig5-lead-dur": "720ms",
  "--sig5-marker-at": "2000ms",
  "--sig5-marker-dur": "540ms",
  "--sig5-deck-start": "1800ms",
  "--sig5-deck-stagger": "190ms",
  "--sig5-deck-dur": "660ms",
  "--sig5-foot-at": "2660ms",
};

const CSS = `
.${PREFIX}-hero-section{
  position:relative;
  box-sizing:border-box;
  min-height:92vh;
  min-height:92svh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:clamp(28px,5vw,56px) clamp(24px,5vw,56px);
  background:var(--sig5-paper);
  border-bottom:1px solid var(--sig5-hairline);
  font-family:var(--sig5-font);
  color:var(--sig5-ink);
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  text-rendering:optimizeLegibility;
  overflow:hidden;
}
.${PREFIX}-hero-section *{box-sizing:border-box;}

/* ---- The front page spread ---- */
.${PREFIX}-page{
  position:relative;
  width:min(1120px,100%);
  margin-inline:auto;
}

/* ---- The overture (Act I) — the idea, spoken before the interface ----
   Absolutely positioned within the page column so it never displaces the
   settled spread underneath (which is already laid out at opacity:0). One line
   is visible at a time; all three share the same grid cell so nothing reflows
   as they cross-fade. */
.${PREFIX}-overture-layer{
  position:absolute;
  top:0;
  left:0;
  right:0;
  height:100%;
  z-index:4;
  display:grid;
  place-items:center;
  padding:0 clamp(16px,6vw,64px);
  pointer-events:none;
}
/* The layer dissolves as the pile takes over — the seed word has already begun
   scattering, so this reads as the idea becoming the mechanism. */
.${PREFIX}-run .${PREFIX}-overture-layer{
  animation:${PREFIX}-ov-out var(--sig5-ov-out-dur) var(--sig5-ease-soft) both;
}
.${PREFIX}-ov-line{
  grid-column:1;
  grid-row:1;
  margin:0;
  max-width:22ch;
  text-align:center;
  text-wrap:balance;
  font-size:clamp(27px,4.4vw,50px);
  font-weight:600;
  line-height:1.06;
  letter-spacing:-0.03em;
  color:var(--sig5-ink);
  opacity:0;
  will-change:transform,opacity;
}
.${PREFIX}-overture .${PREFIX}-ov-1{
  animation:${PREFIX}-ov-inout var(--sig5-ov-dur) var(--sig5-ease-soft)
    var(--sig5-ov-l1-at) both;
}
.${PREFIX}-overture .${PREFIX}-ov-2{
  animation:${PREFIX}-ov-inout var(--sig5-ov-dur) var(--sig5-ease-soft)
    var(--sig5-ov-l2-at) both;
}
/* Line 3 sets and holds; it does not fade on its own — the seed bloom and the
   layer dissolve carry it out, straight into the pile. */
.${PREFIX}-ov-3{
  color:var(--sig5-ink-soft);
}
.${PREFIX}-overture .${PREFIX}-ov-3{
  animation:${PREFIX}-ov-in var(--sig5-ov-l3-dur) var(--sig5-ease-soft)
    var(--sig5-ov-l3-at) both;
}
.${PREFIX}-ov-3 .${PREFIX}-ov-seed{color:var(--sig5-ink);font-weight:660;}
/* The seed word blooms open — scaling up and releasing — and out of it the
   pile appears. Transform + opacity only, so the rest of the line never shifts. */
.${PREFIX}-ov-seed{
  display:inline-block;
  transform-origin:center;
}
.${PREFIX}-overture .${PREFIX}-ov-seed{
  animation:${PREFIX}-ov-seed var(--sig5-ov-seed-dur) var(--sig5-ease-rack)
    var(--sig5-ov-seed-at) both;
}

/* ---- The packed note field (the pile) — motion UNCHANGED ---- */
.${PREFIX}-noise-field{
  position:absolute;
  top:var(--sig5-field-top);
  left:0;
  right:0;
  bottom:0;
  z-index:0;
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  grid-auto-rows:min-content;
  align-content:start;
  gap:9px 12px;
  pointer-events:none;
}
.${PREFIX}-static .${PREFIX}-noise-field{display:none;}
/* The pile emerges out of the seed bloom rather than popping in. Short enough
   that it is fully present by the time the read sweep reaches the upper rows. */
.${PREFIX}-run .${PREFIX}-noise-field{
  animation:${PREFIX}-ov-in 260ms var(--sig5-ease-soft) both;
}

/* Read sweep: one indigo line, top to bottom, once. */
.${PREFIX}-sweep{
  position:absolute;
  top:0;
  left:-4px;
  right:-4px;
  height:1px;
  background:var(--sig5-indigo);
  opacity:0;
  z-index:2;
}
.${PREFIX}-run .${PREFIX}-sweep{
  animation:${PREFIX}-sweep var(--sig5-sweep-dur) var(--sig5-ease-soft) both;
}

/* Chip = grid cell. Owns the clear / promote move. */
.${PREFIX}-chip{position:relative;}
.${PREFIX}-run .${PREFIX}-chip:not(.${PREFIX}-chip-signal){
  will-change:transform,opacity;
  animation:${PREFIX}-clear var(--sig5-clear-dur) var(--sig5-ease-rack)
    calc(var(--sig5-clear-at) + var(--sig5-vy) * var(--sig5-clear-span)) both;
}
.${PREFIX}-run .${PREFIX}-chip-signal{
  will-change:transform,opacity;
  animation:${PREFIX}-promote var(--sig5-promote-dur) var(--sig5-ease-rack)
    var(--sig5-promote-at) both;
}

/* Drift = idle life, tiny and slow, phased per chip. */
.${PREFIX}-drift{transform:translateY(0);}
.${PREFIX}-run .${PREFIX}-drift{
  animation:${PREFIX}-drift calc(5200ms + var(--sig5-di) * 70ms) ease-in-out
    calc(var(--sig5-di) * -130ms) infinite;
}

/* Note = the visible chip. Owns the read tick + the select dim / lift. */
.${PREFIX}-note{
  position:relative;
  display:flex;
  flex-direction:column;
  gap:2px;
  padding:6px 8px 6px 10px;
  border:1px solid var(--sig5-hairline);
  border-radius:3px;
  background:transparent;
  color:var(--sig5-ink-faint);
}
.${PREFIX}-note-text{
  font-size:11.5px;
  line-height:1.3;
  letter-spacing:.004em;
}
.${PREFIX}-note-meta{
  font-family:var(--sig5-mono);
  font-size:9px;
  letter-spacing:var(--sig5-track-mono);
  text-transform:uppercase;
  color:var(--sig5-ink-faint);
  opacity:.7;
}
.${PREFIX}-note-signal{color:var(--sig5-ink-soft);}
.${PREFIX}-note-mark{
  position:absolute;
  left:2px;
  top:6px;
  bottom:6px;
  width:2px;
  border-radius:1px;
  background:var(--sig5-indigo);
  transform:scaleY(0);
  transform-origin:top center;
}
.${PREFIX}-run .${PREFIX}-note:not(.${PREFIX}-note-signal){
  animation:
    ${PREFIX}-tick var(--sig5-tick-dur) ease-out
      calc(var(--sig5-vy) * var(--sig5-sweep-span)) both,
    ${PREFIX}-dim var(--sig5-select-dur) var(--sig5-ease-soft)
      var(--sig5-select-at) both;
}
.${PREFIX}-run .${PREFIX}-note-signal{
  animation:
    ${PREFIX}-tick var(--sig5-tick-dur) ease-out
      calc(var(--sig5-vy) * var(--sig5-sweep-span)) both,
    ${PREFIX}-lift var(--sig5-select-dur) var(--sig5-ease-rack)
      var(--sig5-select-at) both;
}
.${PREFIX}-run .${PREFIX}-note-signal .${PREFIX}-note-mark{
  animation:${PREFIX}-mark-in var(--sig5-select-dur) var(--sig5-ease-rack)
    var(--sig5-select-at) both;
}

/* ---- Masthead: crisp anchor from t=0 ---- */
.${PREFIX}-masthead{
  position:relative;
  z-index:1;
  display:flex;
  flex-wrap:wrap;
  justify-content:space-between;
  align-items:flex-start;
  gap:6px 16px;
  font-family:var(--sig5-mono);
  font-size:11px;
  letter-spacing:var(--sig5-track-label);
  text-transform:uppercase;
  color:var(--sig5-ink-faint);
  opacity:1;
}
.${PREFIX}-flagline{
  display:inline-flex;
  align-items:baseline;
  gap:12px;
}
.${PREFIX}-flag{
  font-weight:600;
  color:var(--sig5-ink);
}
.${PREFIX}-folio-mast{
  color:var(--sig5-ink-faint);
  font-variant-numeric:tabular-nums;
}
.${PREFIX}-datestack{
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap:3px;
  text-align:right;
}
.${PREFIX}-dateline{
  font-size:10px;
  letter-spacing:.18em;
  color:var(--sig5-ink-soft);
  font-variant-numeric:tabular-nums;
  white-space:nowrap;
}
.${PREFIX}-dateline-sub{
  font-size:10px;
  letter-spacing:.18em;
  color:var(--sig5-ink-faint);
  font-variant-numeric:tabular-nums;
  white-space:nowrap;
}

/* ---- Double Oxford rule — crisp from t=0 ---- */
.${PREFIX}-rule{
  position:relative;
  z-index:1;
  height:3px;
  margin-top:var(--sig5-unit);
}
.${PREFIX}-rule::before{
  content:"";
  position:absolute;
  left:0;
  right:0;
  top:0;
  height:1px;
  background:var(--sig5-rule);
}
.${PREFIX}-rule::after{
  content:"";
  position:absolute;
  left:0;
  right:0;
  top:2px;
  height:1px;
  background:var(--sig5-hair);
}

/* ---- Standfirst band — sets in on Beat D ---- */
.${PREFIX}-standfirst-band{
  position:relative;
  z-index:1;
  margin-top:calc(var(--sig5-unit) * 3);
  display:flex;
  justify-content:space-between;
  align-items:baseline;
  gap:16px 40px;
  opacity:0;
}
.${PREFIX}-run .${PREFIX}-standfirst-band{
  animation:${PREFIX}-soft-in 520ms var(--sig5-ease-soft)
    var(--sig5-standfirst-at) both;
}
.${PREFIX}-static .${PREFIX}-standfirst-band{opacity:1;}
.${PREFIX}-standfirst{
  margin:0;
  max-width:24ch;
  font-size:clamp(19px,2.2vw,22px);
  line-height:1.15;
  font-weight:560;
  letter-spacing:-0.01em;
  color:var(--sig5-ink-soft);
}
.${PREFIX}-subhead{
  margin:0;
  max-width:44ch;
  text-align:right;
  font-size:clamp(14px,1.6vw,15px);
  line-height:1.5;
  color:var(--sig5-ink-faint);
}

/* ---- Drawn hairline — repurposed baseline draw ---- */
.${PREFIX}-band-rule{
  position:relative;
  z-index:1;
  height:1px;
  margin-top:calc(var(--sig5-unit) * 3);
  background:var(--sig5-hair);
  transform:scaleX(0);
  transform-origin:left center;
}
.${PREFIX}-run .${PREFIX}-band-rule{
  animation:${PREFIX}-draw 520ms var(--sig5-ease-soft)
    var(--sig5-standfirst-at) both;
}
.${PREFIX}-static .${PREFIX}-band-rule{transform:scaleX(1);}

/* ---- Body: lead + filed rail ---- */
.${PREFIX}-body{
  position:relative;
  z-index:1;
  margin-top:calc(var(--sig5-unit) * 3);
  display:grid;
  grid-template-columns:minmax(0,1.68fr) minmax(0,1fr);
  column-gap:clamp(40px,4.5vw,72px);
  align-items:start;
}

/* Lead column */
.${PREFIX}-lead{position:relative;}
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
  background:var(--sig5-indigo);
  transform:scaleY(0);
  transform-origin:top;
}
.${PREFIX}-run .${PREFIX}-marker{
  animation:${PREFIX}-grow var(--sig5-marker-dur) var(--sig5-ease-pencil)
    var(--sig5-marker-at) both;
}
.${PREFIX}-static .${PREFIX}-marker{transform:scaleY(1);}

/* Rail column — folded-newspaper spine drawn top to bottom */
.${PREFIX}-rail{
  position:relative;
  padding-left:clamp(40px,4.5vw,72px);
}
.${PREFIX}-rail::before{
  content:"";
  position:absolute;
  left:0;
  top:0;
  bottom:0;
  width:1px;
  background:var(--sig5-hair);
  transform:scaleY(0);
  transform-origin:top;
}
.${PREFIX}-run .${PREFIX}-rail::before{
  animation:${PREFIX}-grow var(--sig5-deck-dur) var(--sig5-ease-soft)
    var(--sig5-deck-start) both;
}
.${PREFIX}-static .${PREFIX}-rail::before{transform:scaleY(1);}
.${PREFIX}-rail-label{
  margin:0 0 14px;
  font-family:var(--sig5-mono);
  font-size:10px;
  letter-spacing:var(--sig5-track-label);
  text-transform:uppercase;
  color:var(--sig5-ink-faint);
  opacity:0;
}
.${PREFIX}-run .${PREFIX}-rail-label{
  animation:${PREFIX}-soft-in 340ms var(--sig5-ease-draw)
    calc(var(--sig5-deck-start) - 140ms) both;
}
.${PREFIX}-static .${PREFIX}-rail-label{opacity:1;}

/* Kicker row: label group flush-left, status chip flush-right */
.${PREFIX}-kicker{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  margin:0 0 10px;
  font-family:var(--sig5-mono);
  font-size:10px;
  letter-spacing:var(--sig5-track-label);
  text-transform:uppercase;
  color:var(--sig5-ink-faint);
  opacity:0;
}
.${PREFIX}-kgroup{
  display:inline-flex;
  align-items:baseline;
  gap:6px;
}
.${PREFIX}-kdot{color:var(--sig5-ink-faint);}
.${PREFIX}-folio{font-variant-numeric:tabular-nums;}
.${PREFIX}-run .${PREFIX}-lead .${PREFIX}-kicker{
  animation:${PREFIX}-soft-in 340ms var(--sig5-ease-draw)
    calc(var(--sig5-lead-at) - 140ms) both;
}
.${PREFIX}-run .${PREFIX}-deck .${PREFIX}-kicker{
  animation:${PREFIX}-soft-in 340ms var(--sig5-ease-draw)
    calc(var(--sig5-deck-delay) - 140ms) both;
}
.${PREFIX}-static .${PREFIX}-kicker{opacity:1;}

/* Status chips: lead solid ink, rail hairline outline. Ride the kicker soft-in. */
.${PREFIX}-tag{
  font-family:var(--sig5-mono);
  font-size:9.5px;
  letter-spacing:.14em;
  text-transform:uppercase;
  line-height:1;
  padding:3px 6px 2px;
  border-radius:2px;
  white-space:nowrap;
}
.${PREFIX}-tag-solid{
  background:var(--sig5-ink);
  color:var(--sig5-paper);
}
.${PREFIX}-tag-outline{
  border:1px solid var(--sig5-hair);
  color:var(--sig5-ink-soft);
}

/* Rail stories */
.${PREFIX}-deck{position:relative;}

/* Horizontal hairline dividers between the rail stories, drawn on their delay */
.${PREFIX}-deck-rule{
  height:1px;
  margin:14px 0;
  background:var(--sig5-hair);
  transform:scaleX(0);
  transform-origin:left center;
}
.${PREFIX}-run .${PREFIX}-deck-rule{
  animation:${PREFIX}-draw 400ms var(--sig5-ease-soft)
    calc(var(--sig5-deck-delay) - 140ms) both;
}
.${PREFIX}-static .${PREFIX}-deck-rule{transform:scaleX(1);}

/* Signal headlines: hidden first frame, then cross-dissolve + clip wipe in */
.${PREFIX}-signal{
  margin:0;
  color:var(--sig5-ink);
  transform-origin:left center;
  opacity:0;
  transform:translateY(6px) scale(0.99);
  clip-path:inset(0 100% 0 0);
}
.${PREFIX}-signal-lead{
  font-size:clamp(28px,4.4vw,40px);
  font-weight:680;
  letter-spacing:-0.028em;
  line-height:1.06;
  text-wrap:balance;
}
.${PREFIX}-signal-deck{
  font-size:clamp(17px,1.9vw,19px);
  font-weight:600;
  letter-spacing:-0.012em;
  line-height:1.34;
  text-wrap:pretty;
}
.${PREFIX}-run .${PREFIX}-signal-lead{
  will-change:transform,opacity,clip-path;
  animation:${PREFIX}-signal-set var(--sig5-lead-dur) var(--sig5-ease-rack)
    var(--sig5-lead-at) both;
}
.${PREFIX}-run .${PREFIX}-signal-deck{
  will-change:transform,opacity,clip-path;
  animation:${PREFIX}-signal-set var(--sig5-deck-dur) var(--sig5-ease-rack)
    var(--sig5-deck-delay) both;
}
.${PREFIX}-static .${PREFIX}-signal{
  opacity:1;
  transform:translateY(0) scale(1);
  clip-path:inset(0 0 0 0);
}

/* Lead dek — quiet standfirst under the lead headline, reveals with the lead */
.${PREFIX}-lead-dek{
  margin:10px 0 0;
  max-width:40ch;
  font-size:clamp(14px,1.5vw,15px);
  line-height:1.45;
  color:var(--sig5-ink-faint);
  opacity:0;
}
.${PREFIX}-run .${PREFIX}-lead-dek{
  animation:${PREFIX}-soft-in var(--sig5-lead-dur) var(--sig5-ease-soft)
    var(--sig5-lead-at) both;
}
.${PREFIX}-static .${PREFIX}-lead-dek{opacity:1;}

/* ---- SET ASIDE index — reveals last with the ledger ---- */
.${PREFIX}-aside{
  margin-top:16px;
  opacity:0;
}
.${PREFIX}-run .${PREFIX}-aside{
  animation:${PREFIX}-soft-in 360ms var(--sig5-ease-soft)
    var(--sig5-foot-at) both;
}
.${PREFIX}-static .${PREFIX}-aside{opacity:1;}
.${PREFIX}-aside-label{
  margin:0 0 8px;
  font-family:var(--sig5-mono);
  font-size:10px;
  letter-spacing:var(--sig5-track-label);
  text-transform:uppercase;
  color:var(--sig5-ink-faint);
}
.${PREFIX}-aside-line{
  margin:0 0 5px;
  font-size:12px;
  line-height:1.35;
  color:var(--sig5-ink-faint);
}
.${PREFIX}-aside-dot{color:var(--sig5-ink-faint);}
.${PREFIX}-aside-time{font-variant-numeric:tabular-nums;}
.${PREFIX}-aside-more{
  margin:9px 0 0;
  font-family:var(--sig5-mono);
  font-size:10px;
  letter-spacing:var(--sig5-track-mono);
  color:var(--sig5-ink-faint);
  font-variant-numeric:tabular-nums;
}

/* ---- Closing ledger — the honest tally ---- */
.${PREFIX}-ledger{
  position:relative;
  z-index:1;
  margin-top:calc(var(--sig5-unit) * 5);
  border-top:1px solid var(--sig5-rule);
  padding-top:calc(var(--sig5-unit) * 2);
  display:flex;
  justify-content:space-between;
  align-items:baseline;
  gap:16px 40px;
  opacity:0;
}
.${PREFIX}-run .${PREFIX}-ledger{
  animation:${PREFIX}-soft-in 360ms var(--sig5-ease-soft)
    var(--sig5-foot-at) both;
}
.${PREFIX}-static .${PREFIX}-ledger{opacity:1;}
.${PREFIX}-tally{
  margin:0;
  max-width:56ch;
  font-size:13px;
  line-height:1.45;
  color:var(--sig5-ink-faint);
}
.${PREFIX}-num{
  color:var(--sig5-ink-soft);
  font-variant-numeric:tabular-nums;
}
.${PREFIX}-three{
  color:var(--sig5-ink-soft);
  font-weight:500;
}
.${PREFIX}-sample{
  margin:0;
  max-width:34ch;
  text-align:right;
  font-size:11.5px;
  line-height:1.4;
  color:var(--sig5-ink-faint);
}

/* ---- CTA row — restrained, editorial, reveals with the ledger ---- */
.${PREFIX}-cta{
  position:relative;
  z-index:1;
  margin-top:calc(var(--sig5-unit) * 3);
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:12px 20px;
  opacity:0;
}
.${PREFIX}-run .${PREFIX}-cta{
  animation:${PREFIX}-soft-in 360ms var(--sig5-ease-soft)
    calc(var(--sig5-foot-at) + 120ms) both;
}
.${PREFIX}-static .${PREFIX}-cta{opacity:1;}
.${PREFIX}-cta-primary{
  display:inline-flex;
  align-items:center;
  padding:9px 16px;
  background:var(--sig5-ink);
  color:var(--sig5-paper);
  font-size:13px;
  font-weight:540;
  letter-spacing:.005em;
  text-decoration:none;
  border:1px solid var(--sig5-ink);
  border-radius:3px;
  transition:opacity 160ms var(--sig5-ease-soft);
}
.${PREFIX}-cta-primary:hover{opacity:.86;}
.${PREFIX}-cta-secondary{
  display:inline-flex;
  align-items:center;
  padding:9px 14px;
  color:var(--sig5-ink-soft);
  font-size:13px;
  text-decoration:none;
  border:1px solid var(--sig5-hair);
  border-radius:3px;
  transition:color 160ms var(--sig5-ease-soft),
    border-color 160ms var(--sig5-ease-soft);
}
.${PREFIX}-cta-secondary:hover{
  color:var(--sig5-ink);
  border-color:var(--sig5-ink-faint);
}

/* ---- Quiet scroll cue — subtle down chevron, bottom centre of the viewport ---- */
.${PREFIX}-scrollcue{
  position:absolute;
  left:50%;
  bottom:clamp(24px,3vh,32px);
  transform:translateX(-50%);
  z-index:1;
  opacity:0;
  pointer-events:none;
}
.${PREFIX}-run .${PREFIX}-scrollcue{
  animation:${PREFIX}-cue-in 520ms var(--sig5-ease-soft)
    calc(var(--sig5-foot-at) + 240ms) both;
}
.${PREFIX}-static .${PREFIX}-scrollcue{opacity:.55;}
.${PREFIX}-chevron{
  display:block;
  width:10px;
  height:10px;
  border-right:1.5px solid var(--sig5-ink-faint);
  border-bottom:1.5px solid var(--sig5-ink-faint);
  transform:rotate(45deg);
  animation:${PREFIX}-bob 1900ms ease-in-out infinite;
}

/* ---- At rest: drop performance hints, stop the idle drift ---- */
.${PREFIX}-rest .${PREFIX}-chip,
.${PREFIX}-rest .${PREFIX}-drift,
.${PREFIX}-rest .${PREFIX}-signal{
  will-change:auto;
}
.${PREFIX}-rest .${PREFIX}-drift{animation:none;}

/* ---- Keyframes ---- */
/* Overture: a line rises in, holds, and lifts away. */
@keyframes ${PREFIX}-ov-inout{
  0%{opacity:0;transform:translateY(12px);}
  16%{opacity:1;transform:translateY(0);}
  74%{opacity:1;transform:translateY(0);}
  100%{opacity:0;transform:translateY(-9px);}
}
/* Overture: a line rises in and holds (the philosophy beat; it is carried out
   by the seed bloom and the layer dissolve, not by its own fade). */
@keyframes ${PREFIX}-ov-in{
  0%{opacity:0;transform:translateY(12px);}
  100%{opacity:1;transform:translateY(0);}
}
/* Overture: the seed word "chaos" blooms open and scatters into the pile. */
@keyframes ${PREFIX}-ov-seed{
  0%{opacity:1;transform:scale(1);filter:blur(0);}
  100%{opacity:0;transform:scale(1.9);filter:blur(1.5px);}
}
/* Overture: the whole layer dissolves as the mechanism takes the stage. */
@keyframes ${PREFIX}-ov-out{
  from{opacity:1;}
  to{opacity:0;}
}
@keyframes ${PREFIX}-soft-in{
  from{opacity:0;transform:translateY(4px);}
  to{opacity:1;transform:translateY(0);}
}
@keyframes ${PREFIX}-cue-in{
  from{opacity:0;transform:translateX(-50%) translateY(-4px);}
  to{opacity:.55;transform:translateX(-50%) translateY(0);}
}
@keyframes ${PREFIX}-bob{
  0%{transform:rotate(45deg) translate(0,0);}
  50%{transform:rotate(45deg) translate(1.5px,1.5px);}
  100%{transform:rotate(45deg) translate(0,0);}
}
@keyframes ${PREFIX}-draw{
  from{transform:scaleX(0);}
  to{transform:scaleX(1);}
}
@keyframes ${PREFIX}-grow{
  from{transform:scaleY(0);}
  to{transform:scaleY(1);}
}
/* Beat A: the read sweep travels the field once. */
@keyframes ${PREFIX}-sweep{
  0%{top:0%;opacity:0;}
  12%{opacity:.9;}
  88%{opacity:.9;}
  100%{top:100%;opacity:0;}
}
/* Beat A: a faint indigo tick as the line reads each chip. */
@keyframes ${PREFIX}-tick{
  0%{background:rgba(79,70,229,0);}
  35%{background:rgba(79,70,229,.10);}
  100%{background:rgba(79,70,229,0);}
}
/* Beat B: noise dims and desaturates. */
@keyframes ${PREFIX}-dim{
  0%{opacity:1;filter:grayscale(0);}
  100%{opacity:.22;filter:grayscale(1);}
}
/* Beat B: the three chosen lift on the faintest elevation. */
@keyframes ${PREFIX}-lift{
  0%{transform:scale(1);box-shadow:0 0 0 rgba(17,17,17,0);}
  100%{transform:scale(1.04);box-shadow:0 1px 2px rgba(17,17,17,.10);}
}
@keyframes ${PREFIX}-mark-in{
  0%{transform:scaleY(0);}
  100%{transform:scaleY(1);}
}
/* Beat C: dimmed noise collapses and drifts aside. */
@keyframes ${PREFIX}-clear{
  0%{opacity:1;transform:translateY(0) scale(1);}
  100%{opacity:0;transform:translateY(10px) scale(0.6);}
}
/* Beat D: the survivors rise and dissolve as the headlines set (position-independent). */
@keyframes ${PREFIX}-promote{
  0%{opacity:1;transform:translateY(0) scale(1);}
  100%{opacity:0;transform:translateY(-8px) scale(1.06);}
}
/* Beat D: a headline sets — cross-dissolve, left-to-right clip wipe, tiny
   scale overshoot. No blur. */
@keyframes ${PREFIX}-signal-set{
  0%{
    opacity:0;
    transform:translateY(6px) scale(0.99);
    clip-path:inset(0 100% 0 0);
  }
  45%{
    opacity:1;
    clip-path:inset(0 100% 0 0);
  }
  62%{
    opacity:1;
    transform:translateY(0) scale(1.008);
    clip-path:inset(0 0 0 0);
  }
  100%{
    opacity:1;
    transform:translateY(0) scale(1);
    clip-path:inset(0 0 0 0);
  }
}
/* Idle drift: the pile is alive, not frozen (~0.5px). */
@keyframes ${PREFIX}-drift{
  0%{transform:translateY(-0.5px);}
  50%{transform:translateY(0.5px);}
  100%{transform:translateY(-0.5px);}
}

/* ---- Body collapse: single column below 720px ---- */
@media (max-width:720px){
  .${PREFIX}-body{
    grid-template-columns:1fr;
    row-gap:32px;
  }
  .${PREFIX}-rail{padding-left:0;}
  .${PREFIX}-rail::before{display:none;}
  .${PREFIX}-standfirst-band{
    flex-direction:column;
    align-items:flex-start;
    gap:10px;
  }
  .${PREFIX}-subhead{
    text-align:left;
    max-width:52ch;
  }
  /* The stacked spread is much taller than the viewport, so centring the
     overture in the whole page column would drop it below the fold. Centre it
     in a viewport-height band anchored to the top of the page instead. */
  .${PREFIX}-overture-layer{
    height:min(100%,74svh);
  }
}

/* ---- Ledger: wrap the sample note under the tally below 560px ---- */
@media (max-width:560px){
  .${PREFIX}-ledger{
    flex-direction:column;
    align-items:flex-start;
    gap:12px;
  }
  .${PREFIX}-sample{
    text-align:left;
    max-width:52ch;
  }
}

/* ---- Mobile (~430px): thin the mosaic, start it lower under the masthead ---- */
@media (max-width:430px){
  .${PREFIX}-hero-section{
    padding:clamp(28px,5vw,56px) clamp(16px,5vw,56px);
  }
  .${PREFIX}-noise-field{
    grid-template-columns:repeat(2,minmax(0,1fr));
    --sig5-field-top:62px;
    --sig5-sweep-span:280ms;
    --sig5-clear-span:340ms;
  }
  .${PREFIX}-hide-mobile{display:none;}
  .${PREFIX}-marker{left:-16px;}
}

/* ---- Reduced-motion safety net ----
   Force the settled front page regardless of JS mode: no note field, no intro,
   no delay, and no first-frame flash of hidden furniture. */
@media (prefers-reduced-motion: reduce){
  .${PREFIX}-hero-section *,
  .${PREFIX}-hero-section *::before,
  .${PREFIX}-hero-section *::after,
  .${PREFIX}-hero-section{
    animation:none !important;
    transition:none !important;
  }
  .${PREFIX}-noise-field{display:none !important;}
  .${PREFIX}-overture-layer{display:none !important;}
  .${PREFIX}-standfirst-band,
  .${PREFIX}-rail-label,
  .${PREFIX}-kicker,
  .${PREFIX}-lead-dek,
  .${PREFIX}-aside,
  .${PREFIX}-ledger,
  .${PREFIX}-cta{opacity:1 !important;}
  .${PREFIX}-scrollcue{opacity:.55 !important;}
  .${PREFIX}-band-rule,
  .${PREFIX}-deck-rule{transform:scaleX(1) !important;}
  .${PREFIX}-marker,
  .${PREFIX}-rail::before{transform:scaleY(1) !important;}
  .${PREFIX}-chevron{transform:rotate(45deg) !important;}
  .${PREFIX}-signal{
    opacity:1 !important;
    transform:translateY(0) scale(1) !important;
    clip-path:inset(0 0 0 0) !important;
  }
}
`;
