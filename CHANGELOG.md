# Signal Analytics · Changelog

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
