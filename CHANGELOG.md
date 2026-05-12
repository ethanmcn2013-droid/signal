# Signal Analytics · Changelog

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
