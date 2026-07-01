# Product Elevation Plan — Signal

**Date:** 2026-05-19
**Method:** 4-advisor panel (Creative Advisor, Product Advisor, UX Advisor, Senior Engineer)
**Status:** APPROVED (plan gate cleared) → IMPLEMENTED → final holistic gate cleared
**Constraint:** Product freeze active — L0–3 defect carve-out only. Not an 8th remediation wave.

---

## Origin

A 25.5s screen-recording walkthrough of `signal.signalstudio.ie/app` surfaced exactly two screens:

1. **Loading state that reads as broken** — a naked indigo circle on full white for ~3.5s.
   Root cause: no `loading.tsx` existed anywhere under `src/app/`, so the route blocked
   with zero streaming; the dot was an uncontrolled cross-origin hand-off artefact.
2. **Terminal quiet-day empty state** — "Nothing to flag today. The board is clear."
   with no path forward, no time anchor, no escape hatch.

## The plan

| # | Pri | Change | Rationale | Cx |
|---|-----|--------|-----------|-----|
| C1 | Critical | Create `src/app/loading.tsx` + `src/app/app/loading.tsx` per DESIGN.md §13 — static indigo dot, `aria-hidden`, zero-JS Server Component, byte-identical, suite-canonical | Missing boundary = zero streaming + uncontrolled white void; the "is it broken?" first impression is the single highest-leverage fix. SR correctly lands on the briefing `<h1>` when content streams in (no interim announcement — §13 rule 8). | S |
| C2 | Critical | voice.ts greeting/body time consistency | Greeting must never contradict body on the only screen a prospect sees. Verified already-correct; web-view UTC greeting limitation pre-exists and is documented — deferred to a per-timezone cron sprint, not introduced here. | S |
| H1 | High | EmptyState escape hatch — one calm line below the untouched quiet-day card: *"Your next briefing builds tomorrow, 6am. Open the Tasks workspace"* → `tasks.signalstudio.ie/app` | Resolves the terminal dead-end and makes the trigger contract legible without a marketing CTA or breaking the calm register. Canonical tokens (`--hairline`/`--paper-soft`), focus-visible ring, link contrast verified 4.63:1 (WCAG 1.4.3). | S |
| H2 | High | Spec conformance: greeting H1 `tracking -0.015em → -0.035em` (DESIGN.md §3); grace-note `uppercase` removed (DESIGN.md §10 bans all-caps body) | Voice drift on the hierarchy anchor; one-character edits. | S |
| Gate-closer | — | FocusBlock card — removed indigo `color-mix` background fill; border now `--hairline` only | Read promotional against the surface's editorial register; bounded, reversible one-line consistency fix on the surface under review. | S |

**Sequence:** C1 → C2 → H1 → H2 → gate-closer. Implemented in that order.

## Explicitly deferred (named, not built — freeze holds these)

- Demo/sample populated state (L) — technically deceptive, outside freeze.
- Trigger library expansion 4 → 10.
- Lazy Turso client + loading-pipeline perf (M) — next non-freeze cycle.
- Per-timezone cron — carries the C2 UTC web-greeting limitation.
- Settings-link surfacing from the empty state (M).

## Gate record

- **Approval gate (plan):** CD 9.6 · PM 9.6 · UX 9.5 · Eng 9.6 — cleared first pass.
- **Per-item implementation gate:** C1 9.8/9.8/9.6 · H1 9.6/9.6/9.5 · H2 9.6/9.5/9.6 ·
  C2 documented deferral · all ≥9.5.
- **Final holistic gate (implemented product):** CD 9.6 · PM 9.5 · UX 9.5 · Eng 9.5 — cleared.

`tsc --noEmit` clean · `next build` clean (26 pages) · no regressions across
loading / quiet-day / full-briefing states.

## Files changed

- `src/app/loading.tsx` (new)
- `src/app/app/loading.tsx` (new)
- `src/components/brief/briefing-view.tsx` (H1 EmptyState, H2 tracking, H2 grace-note, FocusBlock)

## Deployment

Code-complete and panel-certified deploy-*ready*. **Not auto-deployed** — under the
active product freeze, deployment is an explicit operator decision, and the standing
memo places founder outreach (≤2026-05-25) ahead of shipping more product. Before any
`vercel --prod`: run `git status` and scrutinise untracked `src/` files (known
deploy-of-untracked-files hazard).
