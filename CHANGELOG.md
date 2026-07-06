# Signal Analytics · the dispatch

Convention: BRAND.md §6.5. Entries before 2026-05-14 keep their
original shape; the new shape starts at the next cycle.

## 2026-07-07 · A·10 · tightens · the brief ends on the count, not the slogan

**The settled spread now leads with the payoff instead of the philosophy: the standfirst reads "Three things need you today." and the subhead answers it in eight words, "Signal reads the pile. You read one page."** The old ending said the idea twice ("The signal, not the noise." over "Every morning, Signal reads the pile and hands you the few that need you.") after the overture had already taught it; now the overture keeps the philosophy and the spread states the concrete result. The closing ledger sharpens to match: "Signal read 44 updates this morning. 41 could wait. These three couldn't." Same acts, same timings, same reduced-motion and no-JS behaviour; only the landing got quieter and harder.

## 2026-07-06 · A·9 · tightens · the opener takes a breath

**The noise-to-signal opener now runs slower: the overture holds each line long enough to read once and land before the next, and the distillation mechanism unhurries in step — the whole choreography paced up from ~8s to ~10.2s without changing a single beat.** OVERTURE_MS moves 5500→7000 and MECHANISM_MS 2500→3200, and every coupled `--sig5-*` timing is rescaled coherently: the three overture lines get more room, the *chaos* seed still begins to bloom 200ms before the pile emerges so the hand-off stays seamless, and the read → select → clear → promote → set-aside mechanism keeps its relative rhythm at the slower tempo. Reduced motion and no-JS still skip straight to the settled spread. DS drift gate clean.

## 2026-07-05 · A·8 · teaches · the opener says the idea before it shows the interface

**The homepage opener now introduces the philosophy before the mechanism: an idea → philosophy → demonstration → clarity arc, so a first-time visitor understands *why* the animation happens, not just *that* it happens.** The distillation motion (read → select → clear → promote → the Morning Spread) is preserved frame-for-frame; a short spoken overture is placed in front of it. On a near-blank page carrying only the masthead, three plain lines arrive and leave one at a time, unhurried — "Every day, more arrives than you can read." → "Most of it doesn't need you." → "Turn chaos into signal." On the third line the word *chaos* is the seed: it blooms open and scatters, and the pile materialises out of it, so the animation reads as the sentence made true rather than a clever effect to decode. The settled headline "The signal, not the noise." now lands as the philosophy said back to the reader once they have watched it happen. Copy stays outcome-first (no scans/analyses/AI/processes). The whole overture is a play-once, aria-hidden enhancement: SSR still renders the settled spread, and prefers-reduced-motion / no-JS skip straight to it with no overture and no flash. Implemented as a four-stage machine (idle → overture → mechanism → rest) with all motion in scoped CSS keyframes; no new dependencies, DS drift gate clean.

**Signal keeps the suite switcher in its newer shape: visible pills for signed-in app chrome, rich gesture dropdown only where the marketing/public surface earns it.** The local contract check now runs before tests and fails if `/app` chrome drifts back to the hidden dropdown or if the dropdown loses the rich product-gesture refactor.

## 2026-07-02 · A·6 · tightens · Signal's chrome joins the source of truth

**Signal's accepted footer and sticky product header are now applied to current main.** The footer uses the suite-wide frame, includes the Studio iOS status page, and restores the full suite list including Signal itself. The signed-in and public headers keep one shared Signal Studio shell so the briefing reads as part of the suite while the quiet-day surface remains the product's own.

## 2026-07-01 · A·5 · ships · the quiet day becomes the product's proudest page

**The all-clear is now a designed destination — one calm line, set with the same care as a full brief — and the loop around each item finally closes: dismissals stick, and carry-overs age honestly.** On a day when nothing fires, the reader lands on a vertically centred composition: the signal dot ticking its sampled cadence (static under reduced motion), a small greeting, "Nothing needs you today." in display type, one soft line, and the honest mechanics in quiet mono. No card, no border, no gray box — silence rendered as the achievement it is. Behind the read, the "Not really" tap now does what it has promised since A·4: the engine reads not-useful verdicts back at build time and keeps that item out under that trigger (a new reason — say a real deadline — still gets through). Items that survive into a second-plus consecutive day move to the bottom of their block and carry their age in the meta line — "still waiting — day 3" — on web, HTML email, and plain text alike. New `surfaced_items` table powers the aging (fail-safe until the operator applies `drizzle/0003_surfaced_items.sql` against the Signal Turso DB); account erasure and export both cover it from day one. Honest edges: aging uses UTC day boundaries until the per-timezone cron exists, and PRODUCT.md §5.3's day-three suppression clause is deliberately not implemented yet — now that readers hold a real dismiss control, auto-hiding what they chose to keep needs its own considered pass. Branch-pending via PR.

## 2026-06-14 · A·4 · ships · the briefing learns whether it was useful

**Each item now carries one quiet tap — useful, or not — the single feedback signal the product collects, so the trigger set can be tuned against real reads.** A calm "Useful? Yes / Not really" sits under each attention item on the web brief (the email stays read-only by design); tapping acknowledges immediately and records the verdict + which trigger produced the item, with no briefing prose or task data stored. The write is fail-safe: it runs through a server action that no-ops gracefully until the `briefing_feedback` table is applied (operator step — `drizzle/0002_briefing_feedback.sql` against the Signal Turso DB), so the tap never blocks or errors for the reader. No dashboard, no settings, no model. Branch-pending via PR.

## 2026-06-09 · A·3 · cuts · the morning brief stops talking when there is nothing to say

**The briefing reads closer to three things in plain English, and silence reads as silence.** Five cuts on the engine and the marketing surface, closing the product-excellence pass. The `Today` chip in the briefing header is gone (`briefing-view.tsx`) — orphaned dashboard furniture left over from the cut Yesterday toggle. The "Moving well" bucket no longer renders in the default morning brief — the engine already weighted `just-shipped` at 100/1000 (lowest of six triggers), the math said it wasn't signal, the render layer was shipping it anyway. "Suggested focus" is out of the brief — it was a sorted re-projection of items the reader had already seen above; three buckets, not four. `summaryLine()` returns the empty string on a quiet day instead of firing filler like "Light day. The board is moving." — `EmptyState` carries the frame on the silent path. Marketing homepage cuts: the `BriefingCompression` SVG component and the "engine never generates language" interstitial are out — they were teaching the engine, not the brief; quiet inline links to `/law` and `/method` replace them at the close CTA for readers who came for the mechanism on purpose. Deferred (founder-gate): the in-product paywall card that signs off the briefing surface with a `€12/month` line.

## 2026-06-06 · A·2 · tightens · the attention cards stop dramatizing and start naming

**The briefing's headline phrasings now lead with "waiting" instead of "blocked" when a task is sitting open, matching the suite-wide calm vocabulary — `To do · Moving · Waiting · Needs Attention · Done`.** A wedding planner reading "Florist deposit has been blocked for 9 days" feels alarm; reading "Florist deposit has been waiting for 9 days" reads as the fact it is. The status didn't change, the tone did. The relational chain stays — "blocked by Music supplier" keeps the named blocker, because that is the data, not a label.

Three rename sites in the engine. `prose/blocked.ts`: phrasings 1, 2, and 6 — the ones that fire when no blocker title is resolved — lead with "waiting" / "Still waiting." instead of "blocked" / "Still blocked." The "blocked by ${blocker}" phrasings (3, 5) are untouched: the spec keeps "blocked-by" because it names the relationship, not a status pill. `briefing/prose.ts` BLOCKED_TOO_LONG[0] fallback aligns the same way — the path with a named blocker keeps "blocked by Y" verbatim; the path without falls back to "has been waiting for N days". `briefing/triggers.ts` reason string moves from "Blocked for N days — the blocker is outlasting reasonable waiting" to "Waiting for N days — the blocker is outlasting reasonable waiting" so the why-this accordion reads the same calm verb. The "Needs attention / Moving well / Quiet risks / Suggested focus" BLOCK_META labels were already calm — that taxonomy was the model the rest of the suite aligned to.

Mirrors what Tasks shipped in T·81 (lane labels Moving/Waiting) and T·82 (My week briefing sections), and what Roadmap shipped in R·19 (status pill / BigStats / activity feed render `blocked` as "Waiting"), R·20 (calm-attention layer + KIND "Blocker" rename), and R·21 (per-row owner-only attention pill). Internal trigger IDs (`blocked`, `blocked-too-long`), the status enum mirror, CSS tokens (`--status-blocked`), and the `blocked-by` relational language are all untouched — code-domain words stay code-domain. Two tests updated to assert the new fallback string. Typecheck clean. 94/94 prose + triggers + build tests pass.

## 2026-05-28 · A·1 · ships · the homepage reads the room before you ask it to

**The marketing hero is now "The Signal" — a scan line reads the bar chart, the tallest bar blooms on pass, and the caption resolves to "the signal, not the noise."** The entry sequence is unchanged (dot rolls in from the left, letters rise as it passes, the mark settles with its bounce). The second act is entirely new: a 1px electromagnetic line sweeps the chart from left to right, each bar flashes briefly as the line crosses it (reading as genuine data scanning), and the tall bar snaps to attention — spring-height, dimmed context bars, a label that rises into position above it. Caption cross-fades once on the first cycle then holds. Three cycles then the whole sequence replays from the beginning. Three bugs from the prior loader are fixed in the same pass: hairline rule is now genuinely full-bleed (was stopping 310px short), trailing ghost dots anchor correctly to the mark's resting position (were firing at the composer's left edge), and bars-row correctly contains its absolutely-positioned children.

## 2026-05-21 · A·14 · ships · close your account, install the briefing to your home screen

**Settings · Account is reachable from the avatar dropdown beside Notifications, with an irreversible delete that closes your Signal identity in one step; the briefing installs to a phone or desktop home screen.** Typing your email confirms the delete; the server wipes both Analytics databases — the prefs database that holds your Tasks-workspace link and timezone, and the email subscription database that holds your cadence and unsubscribe token — then asks the identity layer to close the account in the same call. There is no grace period; the action is final and visible before you commit to it. Installable add-to-home-screen ships a manifest with the existing wordmark Apple touch icon and a new maskable Android tile. Required for Apple App Store submission later this summer.

## 2026-05-19 · A·13 · ships · the briefing chrome carries four visible pills

**The authed `/app` chrome now shows all four products as always-visible
pills instead of the hidden "signal studio." popover trigger.** The shared
canonical `SuiteSwitcher` replaces the launcher and the standalone wordmark
breadcrumb in the app layout — the active pill is now the
product-you-are-in indicator. It carries the umbrella anchor once, the
dot-morph jump, hover-prefetch and preconnect, byte-identical with the rest
of the suite. Build clean; deployed to prod and verified (200 marketing,
app entry behind auth).

## 2026-05-16 · A·12 · tightens · the footer links are finally thumb-sized

**Every column link in the site footer was an 18-pixel target stacked
eight pixels from the next — fine with a cursor, a coin-toss with a
thumb.** The legal row beneath had a real touch height from the mobile
pass; the column above it never got one. Same footer, two different
reaches.

The column links now carry the legal row's minimum touch height, with
none of the horizontal padding that would skew the column. Desktop is
unchanged; the phone footer is reliably tappable. Caught in a
four-product parity sweep against the S·26 mobile discipline — Roadmap
carried the identical gap and ships the same fix this pass.

## 2026-05-15 · A·9 · tightens · the briefing reads like a person wrote it

**Pixel-verifying the actual signed-in briefing surface caught the
product writing sentences a wedding planner never would.** The
public site was clean; the briefing itself — the thing people pay
for — was not. "Save-the-dates — 96 RSVPs confirmed is done."
"Catch up on send invitations." A task titled with a verb, slotted
raw into a phrase that already had one, came out broken. This only
showed up by rendering the real BriefingView through the real engine
on a phone and a desktop, behind the auth wall.

Three fixes, all in the engine, not the chrome. The Suggested Focus
line now names the task and lets the block header and the due chip
carry the action — "Send invitations · OVERDUE", not "Catch up on
send invitations". This is also more on-brand: §3 says "Suggested
focus" is the strongest verb the briefing is allowed; stacking
"Catch up on" / "Move … forward" onto a title broke that rule as
well as the grammar. The just-shipped phrasing drops "is done" for
"— done" so a title that already states a result doesn't double up.
And the demo/QA task titles are now what a person actually types —
"Save-the-dates", "Music supplier", "Catering headcount" — not
result-stuffed labels built to look good in a screenshot.

Engine + demo data only. 154/154 tests pass, typecheck and build
clean. Verified at 390px and 1440px against the real render.

## 2026-05-15 · A·8 · tightens · the marketing pages stop saying "LLM"

**A full-surface pixel audit at 390px and 1440px found one real
voice defect: "no LLM in the path" on /method and /demo.** Every
public route was screenshotted on the live site at both widths and
read against §3 — the homepage, /demo, /method, /signal, /pricing,
/wedding-planning, /about. Layout, voice, and suite chrome hold
across all of them on a phone and a desktop. The single miss: the
product described its own architecture with "LLM", a tech acronym a
wedding planner would never say, used not as a refusal but as a
positive boast. It read like the thing it refuses to be.

Three strings fixed. "No LLM in the path" becomes "No machine writes
these lines" / "every line, a person wrote it" — same promise (the
words are hand-written and rule-picked, never generated), now in
words the 80% actually use. The "Not an AI workspace" refusal block
is untouched on purpose: naming the jargon to reject it is the
established anti-feature pattern, not a violation.

Copy only. Typecheck and build clean.

## 2026-05-15 · A·7 · cuts · the demo stops promising what the briefing doesn't do

**The cinematic demo used to mime a "Mark done" button and a
Today/Yesterday toggle. The shipped briefing has neither, so the demo
now claims neither.** The single failure mode the brand is built
against is the demo-vs-reality gap: a beautiful demo, then an empty,
different product. Ours had two of them staged on the homepage. The
reader-cursor would glide to a focus line, a "Mark done" pill would
appear, the line would strike through, a "Marked done" toast would
fire — none of which exists in the real brief, because Analytics is a
briefing, not a task manager, and the line between it and Tasks is
load-bearing. A "Today | Yesterday" pill let the demo morph between
two days; the real brief is one read per morning with no view to
switch.

Both are gone. What's left is only what the engine genuinely does:
the briefing arrives, the reader scans it, "Why this" expands a real
reason chain, the phrasing rotates the way it rotates day to day, and
the hard three-item cap holds. The phantom "yesterday" dataset and the
acknowledge wiring were deleted from the data model too — no dead
substrate left implying a feature that was never built. Delight, but
earned by what's true.

Demo-and-data only. 154/154 tests pass, typecheck and build clean.

## 2026-05-15 · A·6 · tightens · the demo speaks to the people it's for

**The homepage audience toggle now offers a wedding planner, a builder,
a freelancer, and a student — not a product launch and a startup.**
The cinematic briefing is the most-seen surface on the site, and two of
its four audiences spoke a language the brand exists to refuse. "Product
launch" talked about export branches, open PRs awaiting review, and an
API v1 spec. "Startup plan" talked about SOC 2 readiness, a closed seed
round, and an investor update letter. A wedding planner clicking through
the demo two interactions in watched the product talk like Jira — the
exact failure the brand is built against, staged in its own shop window.

Both packs are gone. In their place: **Client work** — a freelancer with
an invoice unpaid 31 days, a client sitting on logo feedback, a tax
return due in six days, three projects landing the same week in April —
and **Final year** — a student with a dissertation chapter due in three
days, unread supervisor feedback, seminar reading not started, deadlines
stacked into the last week of term. Real money, real deadlines, real
consequences, in the words those people actually use. The toggle is now
wedding · building · freelance · student — the audience the suite is
for, end to end, with no seam where the voice slips.

Content only. No engine change, no schema change. The highest-leverage
lever was the words, and the words now hold.

## 2026-05-15 · A·5 · hardens · the briefing stops overpromising and starts failing loud

**A full code review went looking for the gap between what Analytics
says and what Analytics does, and closed it.** The marketing site sold
a four-rule engine; the engine has shipped six rules since v1. `/method`,
the homepage pillar, and the briefing anatomy now name all six —
stalled work, due-and-overdue, just-shipped, a crowded week, long-held
blockers, and too much in flight — and the bucket copy matches where
those rules actually land. The brand also quietly retired antique gold
months ago, but the in-app brief and *every email ever sent* still
fell back to a purple `#7c5cff`; it's indigo `#4f46e5` now, the way
the rest of the suite has been all along.

**The sign-in and sign-up pages rendered an empty `<body>`.** Anyone
clicking through from /pricing hit a blank screen. Clerk's `<SignIn/>`
and `<SignUp/>` are mounted now, hash-routed so no catch-all segment
was needed.

**Silent success was the backend's favourite failure mode.** A missing
`RESEND_API_KEY` in production used to return `ok: true · skipped` —
the cron stayed green while zero emails went out. It's a hard error in
production now. The read-only Tasks token self-heals on rotation
instead of returning empty signals forever. The cron pacing respects
Resend's rate limit so a burst doesn't 429 real subscribers into a
24-hour wait. Preferences upsert is race-safe. The Studio ping refuses
to send its bearer anywhere that isn't a signalstudio.ie host. And the
DB client is lazy now, so a preview without Turso envs builds instead
of throwing at import.

**The test-send button skipped the tier gate the cron enforces** —
free users could spam it every 60s. Same `workspace`-tier check now.

**Hygiene.** `clsx` and `zod` were installed and never imported —
gone. `packageManager` is pinned so Vercel stops guessing and the
stray `pnpm-lock.yaml` stops re-appearing. `npm test` no longer loads
`.env.local` (and its live prod tokens) into the test process; use
`test:local` for that. A composite `(cadence, last_sent_at)` index
keeps the daily fanout off a full table scan. The off-screen demo
loop now pauses instead of burning the main thread forever, and the
audience/view toggles are real `radiogroup`s with arrow-key support
instead of broken `tablist`s. Dead `hero-motion.tsx` deleted.

## 2026-05-14 · A·2 · ships · atlas drift-trigger wires into analytics commits

**Analytics commits now flag the umbrella's atlas when a referenced
file changes.** A pre-commit hook in `.githooks/` runs a node
script against the staged file list, resolves any atlas references
that point at this repo, and writes drift into the studio repo's
canonical sidecar. The hook never blocks — drift is a signal, not
a gate. Activation is one `git config core.hooksPath .githooks`.

This is the spec's sign-off criterion: editing
`src/lib/briefing/triggers.ts` flags `analytics-daily-cron` on the
next commit. Verified end-to-end. Auto-stage is gated on
`REPO_ROOT === STUDIO_ROOT`, so commits here leave studio's sidecar
uncommitted for the studio operator. Full spec lives at
`~/Projects/personal/studio/docs/ATLAS_DRIFT_TRIGGER.md`.

## 2026-05-14 · A·1 · tightens · the briefing reads on a phone

**Signal Analytics gets the same mobile parity the umbrella, Tasks,
and Roadmap just shipped. The home page hero "A briefing, not a
dashboard." had a 4px horizontal overflow at 390w and a descender
collision in the H1; both fixed. Clerk sign-up tap targets bumped to
48px, viewport-fit for notch hardware, footer legal strip lifted to
32×12. No product change — mobile hygiene against the same
disciplines as S·26, T·47, and R·1.**

The 4px overflow at 390w wasn't a UX-breaking horizontal scroll
today, but it told the truth that no overflow guard was in place.
`html, body { overflow-x: clip }` lands as the belt-and-braces fix;
the 4px is now clipped rather than scrollable. A future audit can
find the actual element extending past the viewport without it being
a live conversion-path problem.

The H1 collision was the same pattern: 47px font / 45px line-height,
descenders into next-row caps. A `@media (max-width: 640px)` block
in globals loosens `.h-display`, `.h-title`, `.h-section`, and `h1`
leading from 0.96–1.10 to 1.04–1.18.

Clerk got the mobile correctness treatment — `ClerkProvider` was
previously bare on Analytics, no `appearance` prop. Added one with
`formFieldInput` `!min-h-[48px] !text-[16px]`, `formButtonPrimary`
and `socialButtonsBlockButton` `!min-h-[48px]`. 16px on inputs
prevents iOS Safari's auto-zoom on focus; 48px is the WCAG 2.5.5
floor.

Viewport export gains `viewportFit: "cover"`. Footer legal links
jump from 17×11 to 32×12 with `inline-flex` hit areas and
`safe-area-inset-bottom` padding.

Typecheck clean.


## 2026-05-14 · Email dispatch gated on Workspace tier

The briefing engine runs identically for every tier — what's gated
now is delivery. The daily/weekly cron skips users below Workspace
(reads tier from the shared `signal-entitlements` DB), logging
`reason: free-tier-no-email` in the run summary. Free users still
see their briefing at `/app/brief`; a small aside beneath it links
to `signalstudio.ie/pricing` with one short line about email.

The shared-entitlements client landed in this repo at the same time
(`src/lib/entitlements-shared/`). Forward-compat for E-5b — when we
gate customisation or multi-source reads, the resolver is already in
place.

## 2026-05-13 · Suite design-system v1 · Paper turns white, the dot learns to tick

Fourth product across the line after Studio, Tasks, and Roadmap.

**Paper white, ink at #111.** `--bg` reset from warm-stone `#fafaf7`
to pure `#ffffff`. Ink moved from `var(--ink-900)` (which was `#18181b`)
to the spec's `#111111`. The semantic-token layer (`--paper`,
`--paper-soft`, `--paper-deep`, `--ink`, `--ink-soft`, `--ink-faint`,
`--ink-ghost`, `--hairline`, `--hairline-2`, `--indigo`, `--indigo-soft`)
lands in `globals.css` alongside the existing ramp + aliases so legacy
callsites keep working.

**`.analytics-dot` learns to tick.** Previously the wordmark dot was a
static 5×5 circle with no motion — Analytics's gesture was "ambient,
no animation." Per the new suite spec, Analytics's gesture is now
**M·04 tick — a scope-style vertical pulse every 2.4s.** The dot
squeezes vertically then settles. Registering a signal. The Wordmark
component now renders `.analytics-dot` instead of an inline-styled
span, so the motion picks up from `globals.css`.

**What didn't change.** The Wordmark API (sm/md/lg pseudo-sizes via
font-size string, href, className) is unchanged. Briefing view, the
email template surfaces, and the marketing chrome are all intact —
those get retouched per-page as the system permeates.

**Carries forward.** Phase 5 is Notes — same token set, wordmark
motion to settle (3.2s slow breath).

## 2026-05-13 · Suite review · cron idempotency, GET-safe unsubscribe, voice helpers deduped

### `lastSentAt` was being written but never read.

The cron route at `/api/cron/briefings` now filters `userPreferences`
rows where `lastSentAt` is null OR older than 20h. The column has
been in the schema since Phase A; dispatch has been writing it on
success since Phase C. Nothing was reading it as a filter — a
Vercel retry, manual re-trigger, or deploy rotation would re-send
to everyone considered. Twenty hours is below 24 so a daily run
that slips by a couple of hours still goes out; above 6 so a
fast retry can't.

### `/u/[token]` no longer unsubscribes you when Slack unfurls.

The human-facing unsubscribe landing used to call
`unsubscribeByToken(token)` directly inside the page render — a
GET with side effects. Any image preloader, Slack link unfurl,
AV scanner, or link-checker that followed the URL silently
unsubscribed the user.

Now: GET is a read-only lookup via `lookupByToken`, renders a
"Stop sending briefings to <email>? Yes, unsubscribe" form, and
the mutation happens via a server action POST. Redirects to
`?confirmed=1` after the flip to show the post-unsubscribe state
without re-mutating.

RFC 8058 `/api/unsubscribe/[token]` POST stays auto-confirming
because that's what Gmail and Apple Mail's native one-click button
needs.

### Six triggers, eighteen phrasings, no more pretending.

The engine has had six triggers for a while — stuck-work, due-soon,
just-shipped, crowded-week, blocked-too-long, overload — with three
phrasings each. The closing memo for cycle 6.4 said ten and ~55;
the marketing site's `/method` said "twelve phrasings written by a
person". Three different numbers, three different places, one
correct count.

`/method` now says "eighteen phrasings". The trigger file's own
comment ("Four, intentionally") got bumped to six. Memory entries
that overclaimed the engine size were amended to point at the
real numbers without rewriting history.

### `tasksDbSource` no longer murders the cron when one user fails.

The libSQL `client.execute` calls in `tasks-db-source.ts` had no
error handling. A Turso outage, expired token, or schema drift in
Tasks would throw and abort the whole fanout — every user queued
after the failure would lose their send. Both queries (user
lookup, signals lookup) are now wrapped in try/catch with logs;
either failure returns `[]` so the empty-state render fires for
that user and the rest of the cron continues.

### Voice helpers, one source of truth.

`greeting()`, `summaryLine()`, and `graceNote()` were duplicated
verbatim across three files: `briefing-email.tsx`,
`briefing-view.tsx`, `plain-text.ts`. A voice change in the email
HTML wouldn't reach the web render. Hoisted to
`@/lib/briefing/voice` — every surface imports from one place.

### Cron loop, finally parallel.

The fanout used to be a single serial loop with `await` on every
Resend call. At ~600ms per user, the 60-second `maxDuration` would
fall off a cliff past ~80-100 users. Now chunked with `Promise.all`
six at a time — stays under Resend's per-second rate limit while
not letting one slow user starve the rest. Resend client also now
memoised at module level instead of constructed per dispatch.

### Test-send button, throttled.

`sendTestBriefingAction` had no rate limit — click-spam ran up
Resend cost. Now refuses if `lastSentAt < 60s` ago, with a
specific countdown in the error message.

### Security headers landed (finally).

`next.config.ts` was empty. The Plan 4.1 suite-baseline (HSTS,
X-Frame, Referrer-Policy, Permissions-Policy, CSP Report-Only)
was supposed to be on all four products and never was on
Analytics. Roadmap-pattern headers with Clerk hosts in the
allowlist now live in the config.

### dispatch failure mode named.

`dispatchBriefing` rotates the unsubscribe token AFTER Resend
confirms delivery. If the post-send DB write fails (network blip,
Turso quota), the new email carries a token that doesn't exist in
the DB — clicking unsubscribe would 404. The window is small but
real. Wrapped the DB write in try/catch, logged loudly on
failure, return `ok: true` anyway because the send succeeded.
Next dispatch rotates again cleanly. Documented in the code,
named here so it isn't surprising the day it happens.

### Hygiene.

Duplicate `pnpm-lock.yaml` deleted (this repo is npm-only;
`package-lock.json` is canonical — see CONTRIBUTING.md "Trap 2").
Resend client hoisted. The `localHourMatches()` per-TZ scheduling helper is
still dormant — daily UTC fixed-slot remains the only cadence
until per-user TZ lands.

Operator action owed: verify the cron is actually firing in
Vercel logs. The Phase C closing assumed it does; nobody's
checked the log timestamps recently.

## 2026-05-13 · Cycle 8.4.9 · Cron now reports it ran

The daily briefing cron handler — the one Vercel hits at 06:00 UTC
against `/api/cron/briefings` — now fires a single observability ping at
the end of the run, before the JSON response. The ping goes to a sibling
endpoint on studio (`signalstudio.ie/api/internal/cron-ping`),
Bearer-authed via `STUDIO_CRON_PING_SECRET`, with a 2s `AbortController`
timeout. Studio records the run into a `cron_runs` Turso table that
backs the new `/hq/health` operator view.

The new helper at `src/lib/ops/ping-studio.ts` is deliberately defensive:
returns silently if either of `STUDIO_CRON_PING_URL` or
`STUDIO_CRON_PING_SECRET` is unset, and wraps the fetch in a try/catch
that swallows every error. The contract is *observability must not break
dispatch* — if studio is unreachable, or the secret is wrong, or the
fetch times out, the cron run still finishes, still sends emails, still
returns the same JSON shape. The only thing that changes is whether the
HQ dashboard learns it happened.

Until both env vars land on Vercel production (handoff in
`studio/docs/CYCLE_8_4_9_CRON_STALENESS_HANDOFF.md`), the ping returns
early and the run is invisible to HQ — exactly the same as before the
helper was added.

## 2026-05-14 (latest) · Phase F.4 · Multi-blocker voice tune + plain-text coverage + CONTRIBUTING

Three small wins:

**Multi-blocker voice.** Previously a task blocked by two upstreams
read "blocked by Music supplier (and 1 more)". Now: "blocked by
Music supplier and Venue agreement" — both names. Three+ blockers
keep the "X and N more" form. Reads more conversational, matches
how someone would actually describe the situation. Phrasing helper
takes the full titles array and chooses the form by length.

  0 titles   → "blocked for 9 days"          (generic fallback)
  1 title    → "blocked by Music supplier"
  2 titles   → "blocked by Music supplier and Venue agreement"
  3+ titles  → "blocked by Music supplier and 2 more"

**Plain-text coverage tightened** with 4 new tests targeting the
SUGGESTED FOCUS block (which the prior tests skipped) and the
weekly-cadence footer ("Send daily instead" vs "Send weekly
instead"). `plain-text.ts` branch coverage: 72.73 → 88.00.

**CONTRIBUTING.md.** Documents the two traps that have bitten
already: (1) `import "server-only"` throwing in Node tests, with
the "if it's going to be unit-tested, don't server-only it" rule;
(2) the stray `pnpm-lock.yaml` that keeps re-appearing and breaks
Vercel deploys via package-manager auto-detection. Plus an
architecture quick map and the conventions tests now enforce.

Suite is now **119/119 in 1026ms**. Coverage:

  all files     96.91 / 86.29 / 98.65  →  96.92 / 86.72 / 98.65
  prose.ts      98.08 / 85.33 /100.00  →  97.53 / 85.90 / 100.00
  plain-text    91.40 / 83.33 /100.00  →  92.47 / 88.00 / 100.00

## 2026-05-14 (even later) · Phase F.3 · Dispatch error-branch tests + multi-blocker phrasing

The most important untested branch was `dispatchBriefing`'s error
path — what happens when Resend rejects the send. Now defended.

**Lightweight DI for the sender.** dispatchBriefing accepts an
optional `sender: EmailSender` parameter. Default path constructs
the Resend client from `RESEND_API_KEY` (existing behavior); test
path passes a fake sender that returns whatever response you
construct. No network, no mocking framework, just a parameter. A
companion `persist: boolean` flag (default true) lets tests skip the
DB write that follows a successful send — the error path doesn't
reach the DB anyway, so this only matters for the contract tests.

**13 new dispatch tests** cover:
  - Empty briefing → skipped:`empty-briefing` (sender NOT called)
  - No sender + no `RESEND_API_KEY` → skipped:`no-resend-key`
  - Sender returns error → `{ ok: false, error: "rate_limited" }`
  - Sender error without message → still produces a string error
  - Contract: recipient passed through, Reply-To header set,
    List-Unsubscribe + List-Unsubscribe-Post:One-Click present,
    Daily/Weekly subject prefix, html + text both populated

This locks the email contract in test form. A future refactor that
silently drops the RFC 8058 headers (and breaks Gmail's native
unsubscribe) would now fail a test.

**Multi-blocker prose.** When a task is blocked by ≥ 2 upstream
tasks, the prose now says "Florist deposit has been blocked by
Music supplier (and 1 more) for 9 days" instead of just naming the
first one. Centralised in a `blockerSubject(by, more)` helper so all
three blocked-too-long phrasings produce consistent multi-blocker
form. 6 new prose tests + 1 orchestration test through buildBriefing.

**Server-only import removed from dispatch.ts.** The `import
"server-only"` throws at Node test-load time. dispatch.ts is only
imported by route handlers and server actions (both already server-
only at the framework level), so the redundant safety net was
removed with a comment explaining why. `db/index.ts` and other
real server-only modules keep theirs.

**Env file loaded by test runner.** `npm test` now uses Node 22+
`--env-file-if-exists=.env.local` so the DB-module env check passes
without a real DB call (the tests don't hit the DB; they just need
the module to import without throwing).

Suite is now **113/113 in 530ms**. Coverage:

  all files       97.06 / 84.87 / 99.12  →  96.91 / 86.29 / 98.65
  dispatch.ts          (no tests prior)  →  93.72 / 67.65 / 91.67
  prose.ts        96.27 / 80.60 / 100.00 →  98.08 / 85.33 / 100.00

(all-files line% dipped marginally because dispatch.ts is wider in
absolute terms and only 93% covered; the new coverage is real new
ground, not regression.)

## 2026-05-14 (later) · Phase F.2 · Name-the-blocker + buildBriefing orchestration tests

Two follow-ups to F.1's trigger expansion:

**Name-the-blocker.** `blocked-too-long` brief items now read
"Florist deposit has been blocked by Music supplier (9 days)"
instead of generic "blocked for 9 days". The data was already there
(`blockedBy: string[]` is just task ids); buildBriefing now builds a
{taskId → title} map once at the top of the function and threads
resolved titles down to phrasing via context. Cross-task resolution
in pure functions, no extra DB calls. Falls back to the generic
phrasing when the blocker title isn't in the source — defends
against orphaned references.

All three blocked-too-long phrasings updated to use the resolved
name when present:
  - "has been blocked by X for 9 days"
  - "is waiting on X — 9 days now"
  - "hasn't cleared X in 9 days"

**Bucket-orchestration tests.** 7 new tests in build.test.ts covering
the new trigger paths through buildBriefing:
  - crowded-week lands in needsAttention, not quietRisks
  - due-soon + crowded-week coexist in attention
  - crowded-week outranks stuck-work in focus block
  - blocked-too-long lands in quietRisks, not needsAttention
  - blocked-too-long doesn't double up with stuck-work for the same task
  - name-the-blocker resolves and renders correctly
  - graceful fallback when blocker title isn't resolvable

Suite is now 96 tests in ~267ms. Coverage moved:

  all files        96.88 / 84.38 / 98.20  →  97.06 / 84.87 / 99.12
  build.ts         95.24 / 82.14 / 96.30  →  96.89 / 87.30 / 100.00
  prose.ts         97.39 / 83.05 /100.00  →  96.27 / 80.60 / 100.00*
  triggers.ts      98.53 / 92.65 /100.00  →  98.53 / 92.65 / 100.00

(*prose.ts dipped slightly because adding the `by` branch in three
phrasings introduced more branch points; the new tests cover the
named-blocker case but not every `by ? :` ternary's both sides
exhaustively. Worth a tighter pass later if coverage is load-bearing.)

## 2026-05-14 · Phase F.1 · Trigger library 4 → 6 (crowded-week + blocked-too-long), prose tests close coverage gap

Two new triggers, both with tests, both real product additions:

**`crowded-week`.** Fires when ≥ 3 open tasks have due dates inside
the next 7 days. Emits a single synthetic signal — the cluster is
the signal, not the items. Lands in Needs attention. Earlier than
due-soon (which fires on ≤ 2 days), giving planners visibility on
load *before* the crunch. The wedding-planner archetype: "three
things due this Friday" is the alert they actually need.

**`blocked-too-long`.** Closes a real gap. `stuck-work` deliberately
excludes tasks with `blockedBy.length > 0` (a blocker is a different
problem from neglect). Without `blocked-too-long`, persistent blockers
silently fell through every bucket. Now: any open task with a blocker
AND ≥ 5 idle days lands in Quiet risks with the action "chase the
blocker on {title}". Tests assert these two triggers cover the full
idle-task space together — neither double-counts.

Focus weights for the six v1 triggers:

  due-soon          1000
  crowded-week       800
  stuck-work         700
  blocked-too-long   600
  overload           500
  just-shipped       100

Tests
  - `triggers.test.ts` gained 14 tests across the two new detectors
    (boundary conditions, severity ordering, gap-coverage proof)
  - New `prose.test.ts` (29 tests) drives every trigger × every
    rotation index → asserts non-empty output, context propagation,
    three distinct phrasings per trigger, no chart-language artifacts,
    modulo rotation behaviour

Suite is now **89 tests in 266ms**, up from 46. Coverage moved:

                  line%   branch%  func%
  all files       96.88   84.38    98.20    (was 95.53 / 83.26 / 91.84)
  prose.ts        97.39   83.05    100.00   (was 82.65 / 77.50 /  73.91)
  triggers.ts     98.53   92.65    100.00   (was 96.95 / 92.00 / 100.00)

Email body also got the cadence stamp lead — the date strip in the
wordmark header reads `DAILY SIGNAL · TUE 14 NOV` so the body alone
tells the reader which cadence this is.

## 2026-05-14 · Phase E.4 · Email-render smoke tests + coverage tooling + cadence stamp in body

Three small wins, all in service of "we know this isn't broken".

**Email-render smoke tests.** 11 new tests in `src/lib/email/render.test.ts`
covering `<BriefingEmail/>` and `renderBriefingText()`. Asserts that
the React Email integration produces valid HTML for empty / full
brief shapes, that firstName personalisation works (and falls back),
that all three footer links land in both html and plain-text, that
both cadence variants are recognisable from the body alone. Total
suite is now 46 tests in ~300ms.

The smoke tests caught a real UX gap before any user did: the email
body had no visible cadence indicator after the Phase C polish
rebuild (the wordmark header strip replaced the old "DAILY SIGNAL"
eyebrow). The subject line said "Daily Signal · …" but the body
glanceably looked the same for daily and weekly. The render test
asserted what we *wanted* the body to communicate, then the failing
test surfaced what was missing.

**Fix:** the date strip in the wordmark header now leads with the
cadence stamp: `DAILY SIGNAL · TUE 14 NOV` instead of just `TUE 14
NOV`. The body alone now answers "which cadence is this" — useful
when someone wants to switch via the footer link.

**Coverage tooling.** Added `npm run test:coverage` using Node's
built-in `--experimental-test-coverage`. Zero new deps. Today's
snapshot:

  all files            95.53% line / 83.26% branch / 91.84% function
  build.ts             97.30% / 84.62% / 96.30%
  triggers.ts          96.95% / 92.00% / 100.00%
  briefing-email.tsx   97.80% / 82.35% / 94.12%
  plain-text.ts        91.40% / 72.73% / 100.00%
  prose.ts             82.65% / 77.50% / 73.91%

prose.ts is the laggard — not every phrasing variant is exercised
yet. Worth backfilling when adding the next trigger.

## 2026-05-13 (even later still) · Phase B.3 · Real movedToShippedAt from activities

Replaced the v1 heuristic (`lane='shipped' && idleDays<1 → now - idleDays*DAY`)
with a real join into Tasks's `activities` table. The just-shipped
trigger now fires from honest data instead of guessing.

The query joins each task to a subquery returning the MAX
`created_at` from activities where `kind IN ('toggleComplete', 'move')`.
Unix seconds converted to ms inline (`* 1000`). Used only when
`lane='shipped'`; null otherwise.

  SELECT
    t.id, …,
    ( SELECT MAX(a.created_at) * 1000
      FROM activities a
      WHERE a.task_id = t.id
        AND a.kind IN ('toggleComplete', 'move') ) AS shipped_activity_at
  FROM tasks t
  …

Honest finding worth documenting: in the owner's current Tasks DB,
**no shipped task has a `toggleComplete` or `move` activity recorded
yet** — only `taskAdd`. So the just-shipped trigger fires more rarely
than the v1 heuristic, but it now fires *correctly*. The
collaboration-loop brand promise ("never claim what the data doesn't
prove") favours strict correctness over false-positive frequency.

Tasks-side observation surfaced to a future cycle: the toggleComplete
write path on the Tasks API should be audited to confirm it actually
logs activities. Memory says it does; this DB suggests it doesn't,
for these particular tasks.

## 2026-05-13 (even later) · Phase E.3 · Engine unit tests — math defended

The briefing engine has accrued enough load-bearing math (4 triggers,
severity weighting, focus ranking, dedup, bucket caps, per-day prose
rotation) that not having unit tests was reckless. Today the engine
got 35 of them. Pure-function, deterministic, < 1s to run.

  - `triggers.test.ts` — 21 tests across all four detectors. Confirms
    the boundary conditions hold (idle < 3 stays out, idle ≥ 3 flags;
    overload at exactly 5 ignored, > 5 flags; due within 2 days flags,
    > 2 days doesn't; etc.). Also asserts the severity ordering claims
    the engine documents in comments (overdue > due-today, P0-stuck >
    P3-stuck, 10-day overdue > 1-day overdue, etc.).

  - `build.test.ts` — 14 tests on the orchestration. Hard 3-cap per
    bucket asserted four ways. Dedup confirmed (a task that hits both
    due-soon and stuck-work appears only in Needs attention). Focus
    ranking confirmed (due-soon outranks stuck-work; overdue outranks
    future-due). Per-(user, day) prose rotation: same day → same
    phrasing, 7 days of input → at least 2 distinct phrasings. Plus a
    Wedding 2026 regression check that doubles as a guard for marketing
    surfaces describing this shape.

Runner: `node --test --import tsx`. Zero new dependencies beyond the
existing tsx (added earlier this session). No Jest/Vitest needed —
the engine is pure functions, Node's built-in test runner is the
right tool. Output is the standard TAP-style spec list.

  npm test
  ℹ tests 35
  ℹ pass 35
  ℹ fail 0
  ℹ duration_ms 531

This is the test floor, not the ceiling. Phase B.3 (real
movedToShippedAt) will need tests; future trigger additions must come
with their own. The engine's contract is now explicit in test code.

## 2026-05-13 (later) · Phase E.2 · /app/brief cinematic polish

The web brief learned its motion grammar. Until this cycle, the
in-app surface was a clean read but a static one — the moment of
opening the brief didn't earn the suite's claim about being
"different from a dashboard." It does now.

  Entry stagger. Greeting → summary → bucket headers → items
  cascade in at 60-80ms intervals on first paint. Total reveal
  budget ≈ 800ms — long enough to feel deliberate, short enough
  that you don't wait on it.

  Reader-cursor hover. Hovering any item in a bucket pulls a 2px
  brand-coloured left border onto it and dims the bucket's other
  items to 45% opacity. Lifted from the marketing demo's cursor
  pattern, simpler implementation. Move the mouse, the cursor
  follows. Mouse leaves, everything reverts.

  Why-this as a real motion accordion. Replaced the browser-default
  <details> element with a motion accordion: the disclosure arrow
  rotates 90° on toggle, the height eases open with outExpo, and
  each reason inside fades + slides in on a 60ms internal stagger.
  This is the one expansion email by design omits, so the web view
  owes it the polish.

  Live indicator chip. The top-right of the header now carries a
  small "● Live" dot that pulses on a 2.4s loop — same recipe as
  the assignee-presence pulse in Tasks's anatomy section.

  Ambient focus mark. The Suggested Focus block carries a subtle
  brand-violet dot in the corner that pulses on a 3.2s cycle —
  reinforces that this block is the live actionable layer.

  MotionConfig reducedMotion="user" wraps the entire view, so
  every motion above collapses to zero for users who prefer
  reduced motion. Accessibility prefs win in one line; the
  reader-cursor and accordion still work without animation.

The email render stays deliberately calmer — no motion, no
accordion — because that's the locked v1 contract for the email
surface. The web view is now the one that earns the extra cost.

## 2026-05-13 · Phase E.1 · Personalised greeting + middleware → proxy rename

Two hygiene cycles in one tick.

**Personalisation.** Greetings now read "Good morning, Ethan." instead
of "Good morning." when the recipient's Clerk firstName is available.
The plumbing is opt-in and graceful: the cron handler calls
`clerkClient.users.getUser(userId)` per fanout iteration, catches and
nulls any failure (test rows, deleted users, Clerk hiccup), and passes
`firstName?: string | null` through `dispatchBriefing()` →
`BriefingEmail`/`renderBriefingText`. /app/brief and the Send-test
action read from `currentUser()` directly. When firstName is missing
the greeting silently falls back to the impersonal form. Real product
warmth, no over-claim on data we don't have.

**`src/middleware.ts` → `src/proxy.ts`.** Next 16 deprecated the
`middleware` file convention in favour of `proxy`. The build was
warning about it at every deploy. File renamed (git mv), no behaviour
change — `clerkMiddleware()` from `@clerk/nextjs/server` is still the
right export name (Clerk hasn't moved). Build log now reads
`ƒ Proxy (Middleware)` instead of the deprecation line.

## 2026-05-12 (even later still) · Phase D + B.2 · Send-test + real Tasks DB read

Two cycles in one — both unblocking parts of the same moment.

**Phase D · the second half.** The `/app` chrome shell landed in
this turn alongside a new "Send a test now" button on
`/app/settings/notifications`. The button calls
`sendTestBriefingAction()`, which builds the user's current briefing
and dispatches it through the same pipeline the cron uses — same
template, same plain-text, same RFC 8058 headers, same per-send
token rotation. It honours the same brand promises too: refuses to
send on empty briefings ("Nothing on fire today — no test sent"),
honestly reports a missing Resend key in dev. Result is a small
green/red status pill below the button with a one-line message.

**Phase B.2 · real Tasks DB read.** `src/lib/briefing/tasks-db-source.ts`
joins the Tasks Turso DB by **email** (Tasks and Analytics live in
separate Clerk apps; clerk_id wouldn't match across them). It pulls
all tasks in workspaces the user belongs to, maps Tasks's lane
vocabulary (todo/doing/review/done → next/in-flight/in-flight/shipped)
and priority strings (P0/P1/P2/P3 → 0/1/2/3) to the engine's shape,
and surfaces "from Tasks · {workspace.name}" as the provenance line
per item. movedToShippedAt uses a v1 heuristic (lane=done +
idleDays<1) — Phase B.3 will read the activities table for the
real timestamp.

`src/lib/briefing/get-source.ts` is the runtime selector: if the
TASKS_DATABASE_URL + TASKS_AUTH_TOKEN env vars are set, it returns
`tasksDbSource`; otherwise it falls back to `mockBriefingSource`.
Both /app/brief, /api/cron/briefings, and the Send-test action go
through this factory — `/app/preview-email` deliberately uses the
mock so the QA surface always shows the demo render regardless of
DB state.

The BriefingSource interface gained a `BriefingContext` parameter
({ userId, email }) so cross-product joins can be email-keyed.
`mockBriefingSource` ignores the context. Engine + build pipeline +
all callers updated.

Verified end-to-end against real data: a smoke-test cron run
against the owner's Personal workspace returned `sent: 1, failed: 0`
and produced a brief from 14 live tasks.

## 2026-05-12 · Suite chrome arrived — `/app` got its first shell

Until this turn, Analytics's authenticated routes (`/app/brief`,
`/app/preview-email`, `/app/settings/notifications`) lived under the
root `<RootLayout/>` with no in-app chrome at all — no wordmark, no
suite affordance, no Clerk avatar surface. A user reading their
morning briefing had no visible indication they were inside Signal
Analytics, and no way to jump to Tasks/Roadmap/Notes without typing
a URL.

New `src/app/app/layout.tsx` lays down the same chrome contract the
other three products carry: `signal studio. /` launcher prefix on
the left (click → 4-product popover, HERE tag on Analytics, others
open in a new tab, footer to signalstudio.ie), `analytics·` wordmark
beside it, Clerk UserButton on the right with the same suite-jump
dropdown items the other products got this turn ("Open Tasks", "Open
Roadmap", "Open Notes" — each as a `<UserButton.Link/>`).

New `src/components/suite-launcher.tsx` (inline-style, matches the
CSS-variable design system Analytics uses) and
`src/components/user-button-with-suite.tsx` (Clerk client wrapper)
are the two pieces. Header: h-12, sticky, blurred 88% bg + 160%
saturation — same recipe as the marketing site-nav, just narrower
(max-w-[1140px] kept).

The shell is intentionally thin. Analytics's job is one short read
per day, not a workspace; building a sidebar would invent navigation
the product doesn't need. The chrome here is the suite affordance
plus identity, nothing more.

## 2026-05-13 (later) · Phase C · The email + cron fanout, with the kill-switch wired all the way through

The engine now has a delivery surface. `<BriefingEmail/>` renders the
typed Briefing through `@react-email/components` — same hierarchy as
`<BriefingView/>`, but with inline styles, table-based layout for the
Suggested Focus block (the only place a real layout regression would
hide in Outlook), no Tailwind, no CSS vars, no motion. The "why this
→" expansions stay on the web by design (locked v1 contract).

`dispatchBriefing()` is the wrapper. It refuses to send on two
conditions: the briefing is empty (brand promise — no email on quiet
days) or `RESEND_API_KEY` is unset (graceful no-key dev fallback). On
every real send it rotates the user's `unsubscribeToken` first, so
the new email's unsubscribe links are unique and the old ones die at
the same moment. Headers carry RFC 8058 `List-Unsubscribe` +
`List-Unsubscribe-Post: List-Unsubscribe=One-Click` so Gmail and
Apple Mail surface their native unsubscribe button at the top of the
message — the entire reason we built the POST handler in Phase A.

The cron handler is `/api/cron/briefings`. Bearer `CRON_SECRET` auth.
On every run it fans out to `cadence='daily'` users; on Mondays (UTC)
it also fans out to `cadence='weekly'` users. `cadence='off'` never
gets touched. `vercel.json` schedules a single run at `0 6 * * *`.
The response carries counts (considered / sent / skipped / failed)
and failure reasons by clerk userId, but never email addresses —
the failure log is operator-visible only.

`/app/preview-email` renders the actual email HTML into a sandboxed
iframe. The brief promise: visit this before any Phase C change
that touches render, and you'll see exactly what Gmail sees before
your inbox does.

Subject lines lead with the most attention-worthy item, capped at 60
chars, prefixed `Signal · ` or `Weekly Signal · `. Preview text (the
inbox-list snippet) matches the lead item. Nothing on fire? Falls
back to a calm `Signal · Mon 13 May`.

Owner env still owed before any of this can actually send: `RESEND_API_KEY`,
`RESEND_FROM`, `CRON_SECRET` on the analytics Vercel project (mark
RESEND + CRON_SECRET Sensitive). DKIM for signalstudio.ie still
pending per the older email memory.

## 2026-05-13 · Phase B.1 · The engine + /app/brief surface, on mock data

The briefing engine is real now. Four triggers (stuck-work · due-soon ·
just-shipped · overload). Three prose phrasings per trigger, rotating
per (userId, day) via a stable hash so a user doesn't read the same
sentence two mornings in a row. Suggested Focus ranks across attention
+ risks with a weighted scheme (due-soon outranks stuck-work outranks
overload), capped at three. Hard cap of three per bucket — overflow
lives on the web view, never in email.

The in-app surface lives at `/app/brief`. Server component, auth-gated,
calls `buildBriefing(mockSource, userId)` and renders the typed
Briefing through a shared `<BriefingView/>` — the same render tree
Phase C's `<BriefingEmail/>` will inline. Empty-day behaviour shipped
too: when no trigger fires, the brief shows "Nothing to flag today"
and Phase C will skip the send.

Voice rules honoured throughout: plain English, never chart language,
provenance line "from Tasks · Wedding 2026" under every item, "why
this →" details element on web (skipped in email by locked v1 contract).

Data source is mocked for this phase — a `BriefingSource` interface
with `getSignalsForUser(userId)` whose mock returns the Wedding 2026
shape from the marketing demo. Phase B.2 swaps mock for a Tasks DB
read in one line; the engine doesn't change. This lets the email
render path (Phase C) be built and reviewed today without waiting on
the cross-product Turso token plumbing.

## 2026-05-12 (even later) · Phase A · Settings + opt-out, before any email can send

Analytics earned an authenticated app surface today, and the first
thing built on it is the kill-switch — by design. Before a single
briefing email is allowed to be wired up (Phase C), users have a
weekly-by-default preference, a settings page with three radio options
(daily / weekly / off), and a no-auth one-click unsubscribe route that
honours both link clicks (`/u/[token]`) and the RFC 8058
`List-Unsubscribe-Post` header (`/api/unsubscribe/[token]`). Tokens
rotate on every send so a forwarded link can't be replayed.

Foundation that landed alongside: Clerk wired into the root layout,
`/app/*` routes protected via middleware, Turso/libSQL via Drizzle
with a `user_preferences` table (userId · email · cadence ·
unsubscribeToken · lastSentAt), and a clean .env.example documenting
every secret the operator owes before this can deploy. Phase B
(engine) and Phase C (Resend + cron fanout) sit on top of this
without re-shaping anything.

Brand call buried in here: the unsubscribe landing says "You're off."
in 32-point and a one-line "Change your mind →" link. No "are you
sure", no marketing recovery, no friction. The moment of leaving
treated with the same care as the moment of arriving.

Owner setup owed before this can run anywhere: create a Turso DB
(`turso db create signal-analytics`), set
`TURSO_ANALYTICS_DATABASE_URL` + `TURSO_ANALYTICS_AUTH_TOKEN` and
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` on Vercel
(both Turso vars Sensitive), and run `npm run db:push` once locally
to apply the migration. Phase B starts the morning after.

## 2026-05-12 (later still)

### Suite chrome consolidated — one bar, breadcrumb prefix.

The thin cross-product strip is gone from every Analytics marketing
page. The Analytics wordmark now sits next to a small "signal
studio. /" back-link on a single row. Cross-product discovery
falls back to the footer Suite column. See the umbrella changelog
for the dissent captured inside the decision.

## 2026-05-12

### Suite review patch — the primary CTA stopped opening nothing.

The Analytics hero shipped with a primary CTA reading "Open the
briefing," routed to `/app`. The `/app` route does not exist in
this repo. Every visitor who clicked the loudest button on the
page hit a 404. That's the §2.2 failure mode written in the brand
handbook — demo-vs-reality drift — quietly running on production.

Repointed the CTA to `/wedding-planning`, the page that already
exists and reads honestly as an example briefing. Changed the verb
from "Open the briefing" to "See a sample briefing." Promise now
matches what the click delivers. The briefing pipeline still has
to be built before `/app` is the right destination; this is the
honest interim, not the final answer.

### Cycle 11.4 shipped — cinematic briefing rebuilt at the Tasks bar.

The old homepage demo (HeroMotion + a thin BriefingMotion fade-in
stagger) read as a static example, not a product surface. That's
been replaced wholesale.

Hero is now Tasks-pattern: eyebrow + H1 ("A briefing, not a
dashboard.") + body + CTAs + status pip ("Demo is live · choose an
audience to reseed") + an AudienceToggle + the cinematic briefing
full-width below. Four audience packs share the suite axis with
Roadmap and Notes: Wedding (default per the locked GTM wedge),
Building project, Product launch, Startup plan. Each pack ships its
own four-block briefing content (Needs attention / Moving well /
Quiet risks / Suggested focus), overflow items for the cap-drop
scene, designated swap items for phrasing rotation, and a whole
separate Yesterday's snapshot.

The briefing now arrives in a sender chrome: small Signal Analytics
avatar + "for · Wedding 2026" + a Briefing pill. Each item carries
a provenance line beneath it in mono ("from Tasks · Wedding 2026")
— proves the read model without needing a data viz.

The demo runs a 19-scene loop. The briefing arrives with a
"Delivered to inbox" toast. A single anonymous reader cursor drifts
in, lingers on an item, and clicks it open: a "Why this?" rule
chain expands beneath the item with three lines of plain-English
reasoning ("No status update in 18 days. Held-up items normally
resolve in 8 days at this stage. Threshold crossed → surfaced for
attention."). The final line types out character-by-character with
a blinking caret. The chain closes.

A phrasing variant swaps on the same item (the rotation engine in
1.5 seconds). Two extra items try to enter Needs attention; they
appear briefly, then drop silently as the cap of three holds.

The cursor moves to a focus item with a "Mark done" pill affordance.
It presses the pill. The item strikes through, fades to 36%, fires
the "Marked done" toast, then disappears from the focus block. The
whole briefing then morphs to Yesterday's snapshot — different
items in Needs attention, different counts in Moving well, different
priorities. Holds. Morphs back. Cursor leaves. Reset.

Stack: motion/react, DOM-measured cursor targeting against item
refs, useReducedMotion guard collapses to the assembled briefing.
