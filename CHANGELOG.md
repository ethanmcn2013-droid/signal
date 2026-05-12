# Signal Analytics · Changelog

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
