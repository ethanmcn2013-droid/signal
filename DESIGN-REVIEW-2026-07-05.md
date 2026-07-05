_Signal Studio · Creative Director — Visual Review (Layer 2, Recommend)_

# Signal — Visual & Craft Review

**Date:** 2026-07-05
**Scope:** every visual surface in the repo — the design system (`src/ds`, `src/app/globals.css`), the marketing site, the in-app brief, account/settings, the shared chrome, and the drift-gate that governs all of it. Read-only pass.
**Bar:** the four-name test. Would Apple ship this? Linear? Notion? Arc? Where the answer is no, it's said plainly, with the fix.

---

## The through-line

The design system is genuinely excellent. `src/ds/tokens.css` is Linear-grade writing: three tiers with one direction of reference, nine named type steps each carrying its own leading and tracking, exactly two shadows, four durations, one easing dialect, a fully-mapped dark theme built but not shipped. Read on its own, this is a system Apple would recognise.

**The surfaces are not built on it.** They are built _near_ it. The gap between the written system and the shipped pixels is the entire subject of this review, and it has a single structural cause:

> **The drift-gate watches five doors, and the drift walked through the windows.**

`scripts/ds/ds-check.mjs` enforces exactly five classes: banned hex colours, local redefinition of system tokens, rogue `cubic-bezier()` literals, non-Geist fonts, and a raw-hex ratchet (`ds-check.mjs:26–48`). It does **not** see:

- off-scale type — `text-[15.5px]`, `text-[10.5px]` (no regex for arbitrary Tailwind values)
- off-token tracking — `tracking-[0.14em]` where the token is `0.08em`
- **deprecated aliases** — `var(--brand)`, `var(--ink-quiet)` sail through; they are neither banned hex nor a local redefinition
- the CSS keyword `ease` and off-contract durations — the ease regex only matches `cubic-bezier(...)`, so `transition: color 160ms ease` is invisible
- JS easing arrays — `EASE_OUT = [0,0,0.2,1]` is a number array, not a string the gate can read

So the system is enforced precisely where it was already safe, and unenforced everywhere the surfaces actually drifted. The measured result:

| What the system says | What the surfaces ship |
| --- | --- |
| 9 named type steps | **16 distinct pixel sizes** across 89 uses — 10 of them off-scale, five half-pixel (`10.5 / 11.5 / 12.5 / 13.5 / 15.5px`) that round differently on every display |
| `--tracking-label: 0.08em` | **6 different tracking values** for one label style; the de-facto standard is `0.14em` (8 uses), i.e. the token is the value nobody uses |
| deprecated aliases "removed at 3.0" | **289 alias uses across 56 files** — the burn-down never started |
| "one easing dialect" | 12 bare-`ease` transitions + durations at 160/180/200/260/280/360ms (the contract names four: 80/140/220/400) |
| status colours "functional UI only, never marketing" | the homepage hero pips green `--status-shipped` (`hero.tsx:66`) |

None of this shows as a bug. It shows as _texture_ — the half-millimetre softness that separates "clearly good" from "why does this feel expensive." That softness is the whole game at this tier. Findings follow, ranked by expected improvement to perceived quality.

---

## F1 — The type scale is documented, not used. Nine steps on paper; sixteen sizes on screen. **(highest impact)**

**Surface.** Everywhere. `briefing-view.tsx` alone renders text at 32 / 16 / 15.5 / 13 / 12.5 / 12 / 11.5 / 11px (`:89, :98, :204, :264, :270, :309, :396, :475, :491`). The footer runs 13.5 / 12 / 11px (`site-footer.tsx:37, :40, :135`). Half-pixel values — `text-[15.5px]`, `text-[12.5px]`, `text-[10.5px]` — appear 19 times.

**Reads as.** Nothing, individually. Collectively it is the reason a page never quite locks to a rhythm. `15.5px` body against a `16px` heading against a `12.5px` caption is three sizes doing the work of two, and half-pixels sub-pixel-render differently on every display — the type looks faintly _wet_, never crisp. This is the single largest perceived-quality lever in the repo because type is 90% of every screen.

**The four-name test.** Linear ships four body sizes, full stop, and every screen snaps to them. This repo has the same discipline _written down_ (`tokens.css:96–105`) and ignores it. Apple would not ship a heading at `32px` when the scale's `--text-title` clamp exists two files away.

**Fix.** Map every arbitrary size to its nearest scale step and delete the arbitrary ones. `32px` → `--text-title` (or a new `--text-heading-lg` if genuinely needed — earn it in `tokens.css`, don't inline it). `16px`/`15.5px` → `--text-body` (15) or `--text-body-lg` (17); pick one, the reader cannot tell 15.5 from either. Kill all five half-pixel sizes. Then extend the gate (see F13) so a raw `text-[..px]` fails CI the way a raw hex does today. Ship this and the product gets 30% more expensive with zero new pixels drawn.

**Rank.** 1 — Recommend, staged. Largest quality gain; mechanical but wide (56 files). Do it token-by-token behind the gate extension, not in one heroic diff.

---

## F2 — One label style, six letter-spacings. The token is the value nobody uses.

**Surface.** The mono-uppercase micro-label (eyebrows, section kickers, footer headings). Tracking values in the wild: `0.02em` (`briefing-view.tsx:501`), `0.06em` (`:204`), `0.08em` (`site-footer.tsx:179`), `0.12em` (`danger-zone.tsx:107`), `0.14em` (`hero.tsx:25`, `briefing-view.tsx:131,159`, `site-footer.tsx:135`, +5 more), `0.16em` (`hero.tsx:55`), `0.18em` (`security/page.tsx:21`). The token — `--tracking-label: 0.08em` (`tokens.css:118`) — is used **once**.

**Reads as.** Two eyebrows on two pages that should be siblings but sit at different tensions. On the homepage hero, the top eyebrow is `0.14em` and the "Ten rules pick it" line directly below is `0.16em` (`hero.tsx:25` vs `:55`) — two labels, one breath apart, tracked differently. Nobody names it; everybody feels it.

**The four-name test.** This is exactly the class of detail Arc obsesses over — one label style, one value, everywhere. Six values for one style is the opposite of a system.

**Fix.** Decide the real value (the surfaces vote `0.14em`; the token says `0.08em` — reconcile in `tokens.css`, don't fork), then collapse all six to it and reference `var(--tracking-label)`. Propose the `tokens.css` change to DESIGN.md per the CLAUDE.md divergence rule — the CSS is currently the honest source and it disagrees with itself.

**Rank.** 2 — Recommend. Cheap, high-visibility, one decision.

---

## F3 — The motion contract is violated in the one place motion lives: JavaScript.

**Surface.** `briefing-view.tsx:24–39`. The comment block states these constants "exactly match the `:root` values in globals.css." They do not.

```
CSS  --ease-out:      cubic-bezier(0.23, 1, 0.32, 1)   ← tokens.css:157
JS   EASE_OUT      =  [0, 0, 0.2, 1]                    ← briefing-view.tsx:37
```

Those are different curves — the CSS token is a long, confident settle with a near-vertical launch; the JS array is Material's standard decelerate. Every in-app reveal, hover dim, and accordion (`:151, :256, :379, :392, :416`) animates on the _wrong_ curve while a comment insists it's the right one. `EASE_STANDARD = [0.2,0,0,1]` (`:39`) mirrors nothing in the tokens either. The comment even cites "`--motion-moderate = 320ms`" and elsewhere "`--motion-slow (480ms)`" (`globals.css:310`) — but `--motion-slow` is `400ms` (`tokens.css:164`). The documentation is confidently wrong in three places.

**Reads as.** The single most-used surface in the product — the daily brief — moves on a curve the design system never approved, and the next engineer who "matches the contract" will copy the wrong numbers because the comment vouches for them.

**Fix.** Replace the JS constants with the actual token beziers: `EASE_OUT = [0.23, 1, 0.32, 1]`, `EASE_IN_OUT = [0.77, 0, 0.175, 1]`. Fix the two stale duration comments. Better: generate the JS mirror from `tokens.css` in the vendor step so it can never drift again. This is a motion-feel change, so eyeball the brief after — but the current state is "wrong on purpose without knowing it."

**Rank.** 3 — Recommend. Correctness + the highest-stakes surface.

---

## F4 — The hero pips a status colour on a marketing surface. The system explicitly forbids this.

**Surface.** `hero.tsx:64–68` — the "Demo is live" indicator is a green dot using `var(--status-shipped)` with Tailwind's stock `animate-pulse`.

**Reads as.** A dashboard "online" LED on a page whose entire pitch is _this is not a dashboard._ `tokens.css:69` is unambiguous: status colours are "functional UI only, never marketing surfaces." The hero breaks the rule on the product's front door — and does it with `animate-pulse`, a generic 2s Tailwind keyframe that is not one of the four contract durations and does not read the motion tokens, so it keeps pulsing at full rate even where the contract would have calmed it.

**The four-name test.** Notion would never put a green server-status LED on its homepage hero. It signals "software to operate," which is precisely fail-mode #3 the brand is trying to avoid.

**Fix.** Drop the green. If "the demo responds" needs signalling, use the product's own gesture — the sampled `signal-dot` tick (`globals.css:350`) in `--accent`, or simply the word "Live" in the eyebrow. One earned indigo moment per view; spend it here, not a borrowed status green. Replace `animate-pulse` with a contract-driven animation or nothing.

**Rank.** 4 — Recommend (marketing surface; loop Ethan per the founder-gate convention on the homepage).

---

## F5 — The destructive UI hand-rolls its own red. There is a `--status-blocked` token for exactly this.

**Surface.** `danger-zone.tsx:62–160`. The entire danger zone is painted in `rgba(176,72,72,·)`, `#9a3a3a`, `#e8c9c9`, `#ffffff` — none of which are the system's danger tokens (`--status-blocked #ef4444`, `--status-blocked-bg #fee2e2`). The comment claims the rose-band "stays consistent across the suite so a reviewer flowing through four products sees identical destructive semantics" — but it's consistent by _copied hex_, not by _token_. Change the DS red and this surface silently won't follow.

**Reads as.** A second, private red that almost-but-not-quite matches the system red, plus raw `bg-white` instead of `--paper` and a `rounded-xl` panel (12px — off the radii scale entirely: sm4 / md6 / lg10 / pill).

**Fix.** Repaint from tokens: border/label `--status-blocked`, fill `--status-blocked-bg`, surface `--paper`, radius `--radius-lg`. The "identical across the suite" goal is _only_ achievable through a shared token — that's the whole argument for the token existing. Delete seven grandfathered hexes in the process.

**Rank.** 5 — Recommend. It's the highest-consequence button in the app (irreversible delete); it should be the most on-system, and it's the least.

---

## F6 — Buttons have no shared anatomy. Three auth controls, three different shapes.

**Surface.** Inside one header (`site-nav.tsx:52–103`): "Sign in" is a text link with a pill hint (`:95–101`), "Exit preview" is a bordered pill with inline `borderRadius: 999` and `border: 1px solid var(--border)` (`:56–72`), "View public site" is a bare borderless text button (`:74–91`). The danger zone adds two more button treatments (`danger-zone.tsx:87, 148`), the settings pages more still. There is no `Button` component and no button tokens — every button is bespoke inline style.

**Reads as.** Every button is a one-off. Padding, radius, weight, and hover all vary because nothing centralises them. This is the difference between Linear (one button, five variants, zero drift) and a codebase where each screen re-invents the control.

**Fix.** Introduce one `Button` primitive with `primary / secondary / ghost / danger` variants reading `--control-h-md`, `--radius-md`, the accent/status tokens, and the contract easings. Replace the inline buttons. This also fixes F5 and F7 for free.

**Rank.** 6 — Recommend. Structural; pays down F5, F7, and every future button.

---

## F7 — Almost nothing has a pressed state. Hovers exist; the press is missing.

**Surface.** `:active` appears in the repo **twice**, both in `suite-launcher.tsx` (`:105, :217`). The daily-brief feedback buttons (`briefing-view.tsx:327–344`), the delete confirm (`danger-zone.tsx:148`), "Sign in," and the settings buttons have hover transitions but no `:active` — tapping them produces no acknowledgement between hover and result.

**Reads as.** On touch (where hover doesn't exist at all) these controls feel _dead_ — you tap and nothing confirms the tap landed until the outcome arrives. Apple's entire touch language is built on the press-state acknowledgement; its absence is the tell of a mouse-first build.

**Fix.** Give the `Button` primitive (F6) a single pressed rule — `transform: translateY(0.5px)` or a `--accent-hover` darken on `:active`, `--motion-instant` (80ms). One rule, every button, the whole app gains tactility.

**Rank.** 7 — Recommend. Bundle into F6.

---

## F8 — The same page is named two different things in two navs.

**Surface.** `/method` is labelled **"Ten rules"** in the header (`site-nav.tsx:15`) and **"Method"** in the footer (`site-footer.tsx:59`). The hero reinforces "Ten rules pick it" (`hero.tsx:57`).

**Reads as.** A visitor who scans the top nav for "Method" won't find it; one who learned "Ten rules" up top meets "Method" at the bottom and wonders if it's a different page. The header comment argues "Ten rules" is a deliberate stance-in-the-nav choice — good, then commit to it everywhere.

**Fix.** Rename the footer link to "Ten rules." One-word diff; pure consistency.

**Rank.** 8 — Decide. Trivial, unambiguous, ship it.

---

## F9 — 289 deprecated-alias uses. The burn-down that `tokens.css` promises never began.

**Surface.** `--brand`, `--ink-quiet`, `--border`, `--bg`, `--indigo` appear 289 times across 56 files. `tokens.css:173–187` marks every one "deprecated… removed at 3.0" and names the replacement. `briefing-view.tsx` uses `var(--brand, #4f46e5)` eleven times (`:42–44, :459, :508` …) where `--accent` is the live token.

**Reads as.** Invisible to users today — but this is a loaded gun for the dark theme. The dark map in `tokens.css:196–219` redefines `--accent`, `--ink-faint`, `--hairline`; it does **not** redefine the deprecated aliases. The day someone flips `data-theme="dark"` (the file says it's "a switch, not a migration"), every surface still on `--brand`/`--ink-quiet`/`--border` renders with light-theme values against a dark ground. The "switch" is quietly broken by 289 aliases.

**Fix.** Run the burn-down: codemod aliases → canonical tokens, then teach the gate to fail on new alias uses (F13). This is the precondition for the dark theme ever shipping.

**Rank.** 9 — Recommend. Low visible impact now; hard blocker for a shipped feature the system already paid to build.

---

## F10 — The display headline disagrees with its own token, and the hero forks it again.

**Surface.** Three definitions of "the big headline":

| Source | size | line-height | tracking |
| --- | --- | --- | --- |
| `--text-display` token (`tokens.css:97`) | `clamp(2.75rem, 1.8rem + 4.2vw, 5.5rem)` | 1.04 | −0.04em |
| `.h-display` class (`globals.css:239`) | `var(--fs-display)` | **0.96** | **−0.045em** |
| Hero `<h1>` inline (`hero.tsx:33`) | **`clamp(2.6rem, 1.8rem + 4.6vw, 5.5rem)`** | 0.96 | −0.045em |

Three sources, three different min-sizes and slopes for the _same_ headline.

**Reads as.** The hero H1 and any `.h-display` H1 render at subtly different sizes at the same viewport width — the headline is not one thing. The token, the class, and the inline style each believe they're canonical.

**Fix.** One definition. Reconcile the token to the value the surfaces actually want (they vote 0.96 / −0.045em), delete the hero's inline clamp, apply `.h-display`. Propose the `tokens.css` reconciliation to DESIGN.md.

**Rank.** 10 — Recommend. Fold the value decision into F1/F2's reconciliation pass.

---

## F11 — Transitions speak a dialect the contract banned, and the gate is deaf to it.

**Surface.** 12 transitions use the bare CSS keyword `ease` (`site-nav.tsx:98`, `suite-header.tsx:154,163`, `briefing-view.tsx:260`, `dev-banner.tsx:124`, `suite-launcher.tsx` ×6). Durations in use: 140 / 160 / 180 / 200 / 260 / 280 / 360ms. The contract names four durations (80/140/220/400) and one easing dialect (`tokens.css:154–164`). `ease` = `cubic-bezier(0.25,0.1,0.25,1)`, which is none of the contract curves — but `ROGUE_EASE` (`ds-check.mjs:42`) only matches literal `cubic-bezier(...)`, so the keyword is invisible to the gate.

**Reads as.** Micro-inconsistency in how things move — a 160ms color fade next to a 220ms one, on different curves, reads as "assembled" rather than "designed." Below conscious notice, above the felt-quality threshold.

**Fix.** Replace bare `ease` with `var(--ease-out)`; snap stray durations to the nearest token. Extend `ROGUE_EASE` to also flag `\bease\b`/`ease-in`/`ease-out` keywords and non-token `\d+ms` in transition declarations.

**Rank.** 11 — Recommend. Bundle with F13.

---

## F12 — Iconography has no system. Glyphs, hand-drawn SVGs, and Tailwind defaults share the page.

**Surface.** "Icons" in the repo are: Unicode arrows as affordances (`→` `↗` `&rarr;` — `briefing-view.tsx:381,420`, `site-footer.tsx:150`), hand-authored brand SVGs at a one-off `14×14` inside `40×40` tap targets (`site-footer.tsx:20–26`, `SocialLinks`), plus assorted inline paths. No icon component, no shared stroke width, no size token.

**Reads as.** A text arrow and a drawn glyph are different weights and metrics; mixing them is the visual equivalent of mixing two fonts. The 14px social icons floating in 40px boxes read as under-scaled specks.

**Fix.** Pick one icon strategy — a single stroked set at `1.5px`, sized via a token (`16/20`), centred in the tap target. Keep the text-arrow only where it's genuinely typographic (inline "Why this →"), not as UI iconography.

**Rank.** 12 — Recommend. Lower reach than F1–F5, real at the detail tier.

---

## F13 — Fix the gate, or every fix above re-drifts by Q4. **(the meta-fix)**

**Surface.** `scripts/ds/ds-check.mjs:26–48`.

The gate is the reason all of the above exists — it enforces five classes and is blind to type scale, tracking, spacing, deprecated aliases, keyword easings, and JS motion constants (see through-line). Fixing F1–F12 without fixing the gate means re-reviewing this exact document in six months.

**Fix.** Add drift classes to the ratchet (grandfather current counts, only allow shrink — same pattern as raw hex):

1. **Off-scale type** — flag `text-\[[\d.]+px\]` and raw `fontSize:` not referencing a `--text-*` var.
2. **Off-token tracking / leading** — flag `tracking-\[` / `leading-\[` not in the token set.
3. **Deprecated aliases** — flag `var(--(brand|ink-quiet|border|bg|text|indigo)\b` outside `tokens.css`.
4. **Keyword easings & rogue durations** — extend `ROGUE_EASE` past `cubic-bezier`.
5. **JS motion mirror** — assert the `briefing-view` easing arrays equal the token beziers (or generate them).

Then run `--update-manifest` to grandfather today's debt so CI goes green immediately, and every new PR can only reduce it.

**Rank.** 13 — Recommend, and arguably do this _first_ — it converts F1–F12 from "a heroic sweep someone has to redo" into "a ratchet that closes itself."

---

## What's right — hold the line here

So subtraction doesn't become its own project:

- **`tokens.css`.** The three-tier model, the paired size/leading/tracking, two-shadows-only, the one-easing-dialect intent, and the fully-built dark map are genuinely top-tier. Every fix above is "make the surfaces obey this file," never "change this file" (except the two honest reconciliations, F2/F10, where the CSS already disagrees with itself).
- **Shadow discipline.** Exactly two shadows, hairlines doing the elevation work (`tokens.css:150–152`). This is the restraint that reads as expensive. Do not let a card grow a third shadow.
- **The loading system.** `LOADING_SYSTEM.md` tokens, the frozen `signal-loading-dot`, the pre-paint dot-morph, and reduced-motion honoured down to the wordmark gesture (`globals.css:73–160`) — this is craft most teams never reach. Held.
- **Reduced-motion coverage.** Tokens collapse to 0, `.reveal` forced visible, `prefers-reduced-motion` respected app-wide (`tokens.css:222–230`, `globals.css:378–400`). Correct and complete.
- **The brief's restraint.** No card, no gray box on the all-clear (`briefing-view.tsx:431–516`) — the empty state as destination, not fallback. Exactly right.

---

## Order of operations

1. **F13 first** — extend the gate and grandfather current debt. Everything else becomes a ratchet instead of a sweep.
2. **F1 + F2 + F10** — the type-scale, tracking, and display-headline reconciliation, as one pass behind the new gate. This is the largest perceived-quality gain in the repo.
3. **F6 + F7 + F5** — one `Button` primitive with a pressed state, repaint the danger zone from tokens. Structural; retires three findings.
4. **F8, F4, F11, F3** — the fast, unambiguous cleanups (naming, hero pip, keyword easings, JS motion constants).
5. **F9** — the alias burn-down, as the gate-guarded precondition for ever shipping the dark theme.
6. **F12** — the icon system, when the higher-reach items are done.

If only one thing ships: **F13.** A system this well-written deserves a gate that actually guards it — and with the gate closed, the surfaces come back to the system on their own.

---

_Read-only review. No product files modified. Sources: `src/ds/tokens.css`, `src/ds/tailwind.css`, `src/app/globals.css`, `scripts/ds/ds-check.mjs`, `.ds-grandfather.json`, and the surfaces cited inline. Two `tokens.css` reconciliations (F2 label-tracking, F10 display headline) should be proposed to `studio/DESIGN.md` per the CLAUDE.md divergence rule — the CSS is currently the live value and disagrees with itself._
