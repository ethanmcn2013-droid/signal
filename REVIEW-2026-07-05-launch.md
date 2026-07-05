# Signal Studio — Launch-Readiness Engineering Review

**Date:** 2026-07-05
**Reviewer role:** Principal / Staff engineer, launch approval
**Scope:** Full stack — architecture, data, auth, APIs, caching, performance, security, ops, maintainability
**Bar applied:** Production SaaS intended to scale to millions of users. Long-term excellence, not quick fixes.

---

## 0. Executive summary

Signal is a well-crafted, thoughtfully-commented Next.js 16 / React 19 app. It shows a maturing engineering culture: a prior production-readiness audit (2026-06-18) is referenced throughout and its named blockers (cross-tenant isolation guard, CI, env validation, rate limiting) are genuinely closed. Auth fails closed, the isolation guard runs in CI, and env validation refuses to boot a half-configured production.

It is **not yet ready to approve for a scale-to-millions launch.** The gaps are not cosmetic — they cluster in three areas:

1. **Correctness on the paid surface.** The emailed briefing (the thing paying users actually receive) is built by a *different, thinner* code path than the in-app briefing. Dismissals, carry-over aging, and per-user read-state are silently dropped from email. One-click unsubscribe works only for the single most-recent email and reports false success for all others.
2. **Silent failure + thin observability.** Entitlement-DB outages reclassify every paying user as free and the run still reports green. Logging is ad-hoc `console.*` with no structure. The cron's own failures don't reach Sentry.
3. **Architecture that won't scale as-is.** Four separate Turso databases with inverted, confusing naming; only one is under migration management (the others are hand-applied); a single 60-second daily cron caps email throughput at ~100 users; the entire static marketing site is forced to render dynamically.

### A note on the brief: this is not Supabase

The review request lists **Supabase, database schema, and row-level security**. This codebase does **not** use Supabase. It uses **Turso / libSQL (SQLite) via Drizzle ORM** for data and **Clerk** for authentication. This matters for the review:

- **SQLite/Turso has no row-level security.** There is no database safety net beneath the application layer — the *only* thing stopping user A from reading user B's data is a `WHERE clerk_id = ?` predicate on every query. The team knows this and mitigates it with a static-analysis test (`src/cross-tenant-isolation.test.mjs`) that fails CI if an owner-scoped query is unscoped. That is a good compensating control, but it is a lint, not RLS. See **FA-2**.
- If a move to Supabase/Postgres is genuinely on the table, **RLS is the single biggest security upgrade available** to this product and would turn the app-layer-only isolation into defence-in-depth. See Future Architecture.

The rest of this report reviews the stack that actually exists.

---

## Stack inventory

| Concern | Implementation |
|---|---|
| Framework | Next.js 16.2 (App Router), React 19.2 |
| Auth | Clerk (`@clerk/nextjs` v7), middleware in `src/proxy.ts` |
| Data | Turso / libSQL via Drizzle ORM — **four** databases (see §1) |
| Email | Resend + `@react-email` |
| Rate limiting | Upstash Redis (`@upstash/ratelimit`) — gated, fail-open |
| Monitoring | Sentry (`@sentry/nextjs`) |
| Hosting | Vercel (cron via `vercel.json`) |
| Animation | `motion` v12 |

---

## 1. Architecture: the four-database problem

Analytics talks to **four distinct Turso databases**, and the naming is actively misleading:

| Client module | Env var | Owns | Purpose |
|---|---|---|---|
| `@/server/db` | `TURSO_DATABASE_URL` | `analytics_users`, `phrasing_rotations`, `briefing_feedback`, `surfaced_items` | The real analytics/prefs tables |
| `@/lib/db` | `TURSO_ANALYTICS_DATABASE_URL` | `user_preferences` | Email subscription + cadence only |
| `@/lib/entitlements-shared` | `TURSO_ENTITLEMENTS_DATABASE_URL` | `entitlements` | Shared suite billing tiers |
| `@/server/tasks-db` | `TASKS_DATABASE_URL` | (read-only mirror) | Source data read from the Tasks product |

The var literally named `TURSO_ANALYTICS_DATABASE_URL` holds **only email prefs**, while the analytics tables live behind the generic `TURSO_DATABASE_URL`. This inversion is a standing misconfiguration hazard and it has already produced contradictory config (see **H10**). It also means a single user's state is split across two DBs with no transaction spanning them (cadence/email in one, workspace link/feedback/aging in the other), so account deletion and export must fan out across both and can partially fail (idempotent, but non-atomic).

**Only one of the four databases is under Drizzle migration management.** `drizzle.config.ts` points `schema` at `src/lib/db/schema.ts` (the email-prefs DB), and `drizzle/meta/_journal.json` tracks only `0000_init_user_preferences` and `0001_cadence_last_sent_index`. The migrations for the *primary* analytics DB (`0000_shiny_peter_quill.sql`, `0001_long_miek.sql`, `0002_briefing_feedback.sql`, `0003_surfaced_items.sql`) are **not journaled and are applied by hand** — `feedback-actions.ts:44-47` literally swallows write errors because the table "may not be migrated yet." See **H6**.

---

## Launch blockers

*Must be fixed before approving launch.*

### BL-1 — Emailed briefings ignore dismissals and carry-over aging

The core product promise — tap "Not really" and *"I'll show less of this"* — is honoured on the web but **silently broken in email**, which is the surface paying users actually receive.

The cron calls the pure engine directly with no read-state:

```ts
// src/app/api/cron/briefings/route.ts:147
const briefing = await buildBriefing(source, { userId: row.userId, email: row.email }, now);
// no 4th arg → readState defaults to {} (build.ts:45)
```

Only the web path loads and threads suppression + aging:

```ts
// src/server/briefing/build-for-user.ts:130-140
const [suppressed, ages] = await Promise.all([getDismissedKeys(clerkId), getSurfacedAges(clerkId, now)]);
const briefing = await buildBriefing(source, { userId: clerkId, email: "" }, now, { suppressed, ages });
```

Consequence: a dismissed item keeps arriving in the daily email forever; `ageDays` ("still waiting, day 3", PRODUCT.md §5.3) never appears in email; `recordSurfaced` is never called on the cron path so email carry-over state is never even recorded.

**Fix:** route the cron through `buildBriefingForUser` (the orchestrator) rather than calling `buildBriefing` raw. This also fixes BL-1's sibling problems (web/email divergence, MR-2).

### BL-2 — One-click unsubscribe silently fails for every email except the most recent, and reports success

Two facts combine into a CAN-SPAM/GDPR + deliverability blocker:

1. `dispatch.ts:179` rotates `unsubscribeToken` to a fresh value on **every** successful send. Lookups are exact-match (`preferences.ts:85`). So the moment tomorrow's email goes out, **every prior email's unsubscribe token no longer exists in the DB.**
2. The RFC 8058 one-click handler discards the result and always returns 200:

```ts
// src/app/api/unsubscribe/[token]/route.ts:21-23
const { token } = await ctx.params;
await unsubscribeByToken(token);        // {ok:false} on no-match, discarded
return new NextResponse(null, { status: 200 });
```

A user who taps "Unsubscribe" on any email older than ~24h (daily cadence) gets a 200 and Gmail/Apple Mail shows "unsubscribed," but cadence is unchanged and briefings keep coming → spam complaints → sender-reputation damage that harms deliverability for the whole list.

**Fix:** make unsubscribe durable across all previously-sent messages (e.g. a stable per-user unsubscribe secret used for lookup, separate from a rotating replay-defence nonce; or a token-history table). At minimum, the handler must not report success on a non-match. Note **MR-1** compounds this: a post-send DB-write failure also permanently kills that email's link.

---

## High-risk issues

### HR-1 — Entitlement-DB outage silently drops all paid email and reports green

`resolveEntitlement` fails open to `free` and swallows the error with no log:

```ts
// src/lib/entitlements-shared/reads.ts:35-39
try { return await resolveEntitlementOrThrow(clerkId); }
catch { return FREE_DEFAULT; }
```

The cron then treats `free` as "no email" (`route.ts:136`). So if the shared entitlements DB is down/slow, **every paying user is reclassified free and gets nothing** — and the run returns `ok: true` with `pingStudio` reporting healthy, because skips aren't failures and there's no warning for a mass free-classification. Revenue-affecting, monitoring-invisible. The codebase already has `resolveEntitlementOrThrow` for exactly this distinction; the cron should use it (and/or log the catch and emit a warning when the free-rate spikes).

### HR-2 — Email fanout has a hard scaling ceiling (~100 users) and starves the tail

`maxDuration = 60` with `CONCURRENCY = 2` and `CHUNK_PAUSE_MS = 1100` (`route.ts:33,118-119`), plus per-user Clerk `getUser` + entitlement query + 2 Tasks-DB queries + Resend send + DB write. That caps a run at roughly **~100 recipients before the 60s wall.** Rows are processed in unspecified `select()` order (no `ORDER BY`), so once the list exceeds the budget the *same tail* is never reached on subsequent days either. This is fine for closed beta and a wall at launch scale. It is also N+1: entitlements and Clerk lookups are per-user but both are batchable (`WHERE user_clerk_id IN (...)`, Clerk bulk fetch). **Fix:** move to a queue / Resend batch send, batch the lookups, and raise paid-tier throughput.

### HR-3 — CSP is Report-Only and permits `unsafe-inline`

`next.config.ts:50` ships `Content-Security-Policy-Report-Only` — **not enforced**, so today CSP provides zero XSS protection. A collector now exists (`/api/csp-report`) so the runway to enforce is short, but `script-src` also includes `'unsafe-inline'` (`:32`), which negates most of CSP's value even after promotion. For a scale-to-millions security bar this must move to enforce, and inline scripts should move to nonces. (The other headers — HSTS+preload, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` — are correctly enforced.)

### HR-4 — Site-wide auth bypass hinges on a client-readable env flag

`getAccessMode()` resolves `NEXT_PUBLIC_SIGNAL_ACCESS_MODE` (a **client-baked** var) *first* (`access-mode.ts:39`), and the proxy bypasses all auth on demo/review:

```ts
// src/proxy.ts:44 and :94
if (isDemoMode()) return;                 // inside clerkMiddleware
if (isDemoMode()) return NextResponse.next();  // before it even runs
```

The documented "SAFETY INVARIANT" (demo never unlocks the real DB) is a *convention enforced by env hygiene*, not by code on every path — and it is untested. If `NEXT_PUBLIC_SIGNAL_ACCESS_MODE=demo` is ever set on the production project (which holds the real DB envs), the auth gate is disabled site-wide. **Fix:** make the production-vs-demo decision server-only and refuse `isDemoMode()` when production DB credentials are present; add a test for the invariant (see **HR-9**).

### HR-5 — CI never runs `next build`; lint is non-blocking; tests are untyped

`.github/workflows/ci.yml` runs `typecheck → ds:check → test → lint (continue-on-error)`. There is **no `npm run build`**, so the whole class of Next.js build-time errors (RSC serialization, server/client boundary violations, route-config errors) ships undetected and fails only at `vercel --prod`. Lint never gates (`:59-61`) and is known-dirty. And `tsconfig.json:40-41` excludes `*.test.ts` from typecheck while tests run via `tsx` — **test code is never type-checked** and can silently drift from the types it claims to exercise. **Fix:** add `next build` to the required gate; ratchet lint to blocking; type-check tests.

### HR-6 — Only one of four databases is under migration management

As described in §1, the primary analytics DB's schema changes are applied by hand with no journal, no automation, and no CI verification — and application code defensively swallows "table not migrated yet" errors (`feedback-actions.ts:44`). A production deploy can reference a table that hasn't been created. **Fix:** bring every DB under managed migrations (separate Drizzle configs/dirs per DB), run migrations as a deploy step, and remove the "not migrated" catch once schema is guaranteed. Also: the `drizzle/` folder mixes two DBs' migrations with duplicate `0000_*`/`0001_*` prefixes — split them.

### HR-7 — Persisted phrasing rotation is disconnected and writes the wrong enum

The `phrasing_rotations` table is read and written but has **zero runtime effect**: `build-for-user.ts:85` fetches `rotationsBefore` and never uses it; `buildBriefing` derives phrasing purely from `dayRotation(userId, now)` and takes no rotation argument. Worse, `bumpRotations` is fed `item.trigger as unknown as TriggerId` (`build-for-user.ts:153`), but `item.trigger` is a `TriggerKind` (`"stuck-work"`, `"due-soon"`, …) — a *different vocabulary* from `TriggerId` (`"blocked"`, `"overdue"`, …). Only `"overload"` overlaps. So the table is populated with wrong-enum values and the PRODUCT.md §9 "no phrasing twice in 14 days" guarantee it claims to provide is not enforced. **Fix:** either wire rotation into the engine for real, or delete the subsystem and the writes. The `as unknown as` cast is the tell — it's papering over a genuine type mismatch.

### HR-8 — Root layout forces the entire static marketing site to render dynamically

`src/app/layout.tsx` renders `SiteNavConditional`, an async server component that calls `await auth()` in the **root** layout. `auth()` is a dynamic API, so every route inheriting the root layout is opted into per-request SSR — including all `(marketing)` pages (`about`, `pricing`, `method`, `security`, `privacy`, `terms`, home, …), which contain **no per-request data at all** (no `fetch`/`db`/`auth` in that tree). They should be static/ISR and instead are SSR'd on every hit. This is the single biggest TTFB and cost-at-scale win available. **Fix:** resolve the authed-nav state in a leaf/segment (or a client component reading Clerk state) so marketing routes stay static.

### HR-9 — Safety- and security-critical modules have zero tests

No tests exist for: `access-allowlist.ts` (who reaches `/app`), `access-mode.ts` (the auth-posture "safety invariant"), `require-app-access.ts`, `sentry-scrub.ts` (PII stripping), `ops/ping-studio.ts` (`isAllowedHost` credential-leak guard), the top-level `deleteAccountForUser` path (destructive/irreversible), `unsubscribeByToken`, `ratelimit.ts`, and the whole `server/briefing/{rotation,read-state,build-for-user}` orchestration. These are exactly the modules where a silent regression is a security/compliance incident. **Fix:** add tests, prioritising the auth/access/PII trio.

### HR-10 — Env configuration drift

- `server/db/index.ts:15` **throws at boot** in Vercel when `TURSO_DATABASE_URL` is unset, but `env.ts:35` classifies that same var as merely *recommended* (warn-only), and `.env.example` documents only `TURSO_ANALYTICS_*`. An operator provisioning from `.env.example` gets a boot crash.
- `SIGNAL_ALLOWLIST` (the closed-beta gate's source of truth) is undocumented; if unset, only the hardcoded founder email reaches `/app` (fails closed, but silently locks out all invitees).
- `TURSO_ENTITLEMENTS_*` and `TASKS_*` are never validated at boot despite gating billing and all real briefing data.

**Fix:** make `env.ts` the single source of truth, validate all four DBs' credentials, and regenerate `.env.example` from it.

---

## Medium-risk improvements

- **MR-1 — Post-send DB write failure permanently kills that email's unsubscribe link.** `dispatch.ts:175-187` sends first, then persists the rotated token; on write failure it logs and returns `ok:true`, leaving the sent email carrying a token the DB never stored. Acknowledged in-code, but combined with BL-2 it's a silent compliance hole.
- **MR-2 — Web and email briefings can disagree for the same user.** Web reads `dataSource.read(workspaceId)` (keyed on `linkedWorkspaceId`); email reads `tasks-db-source.ts` (keyed `email → users.id → workspace_members`) — different keys, different SQL, different lane-mapping code, different `sourceLabel`. The web path also hardcodes `priority: 2` for every task (`build-for-user.ts:109`), discarding real priority that the email path parses. Two surfaces, two truths. Unify on one pipeline.
- **MR-3 — `surfaced_items` is missing from the cross-tenant isolation guard.** `OWNER_TABLES` in `cross-tenant-isolation.test.mjs:38-43` lists four tables but omits `surfacedItems`, which is owner-scoped by `clerkId`. An unscoped query against it would pass CI silently. Add it.
- **MR-4 — Briefing is rebuilt on every request with no caching, and GET mutates the DB.** `/app` and `/app/brief` run several sequential cross-DB/network awaits per render (Clerk + prefs + tasks + entitlements), uncached, and `buildBriefingForUser` *writes* (`bumpRotations`, `recordSurfaced`) during a GET page render — so the render is non-idempotent and un-cacheable, and hammering `/app` writes rows. Cache the deterministic daily briefing per user; move writes out of the render path.
- **MR-5 — `tasks-db-source` caps at `LIMIT 200 ORDER BY t.id`.** Ordering by creation id, not relevance, means an overdue/due-today task with a high id is excluded before triggers run for workspaces >200 tasks. Filter `lane != 'done'` and order by due/activity before capping. `read()` in `data/source.ts` has no limit at all — unbounded scan.
- **MR-6 — Two full trigger/prose engines; only one is live.** `src/lib/triggers/**` (10 detectors) + `src/lib/prose/**` are dead at runtime; the live engine is `src/lib/briefing/{triggers,prose}.ts` (6 triggers). Thresholds have already drifted between them (overload fires at >5 in one, >8 in the other). A maintainer editing the dead tree has no effect and no warning. Delete it or make it canonical. (Marketing advertises "10 triggers"; the engine ships 6 — product mismatch.)
- **MR-7 — Broken CSS in the long-wait loader.** `long-wait-status.tsx:51` pastes a `// ds-allow …` comment *inside* the CSS `transition` string value; `//` is invalid CSS so the whole declaration is dropped and the promised 200ms fade never runs — copy hard-snaps at 5s on slow loads.
- **MR-8 — `/app` loading violates the codebase's own documented loading law.** `app/loading.tsx:30` and the layout Suspense fallback paint a `position:fixed; inset:0; z-index:9999` full-screen overlay *over* the just-rendered `SuiteHeader`, contradicting the rule stated in `brief/loading.tsx:6` ("once chrome exists, loading stays inside the content region"). Also two nested Suspense boundaries render the identical fallback (`layout.tsx:46` + segment `loading.tsx`).
- **MR-9 — 2.5 MB video auto-downloads on `/demo`.** `demo/page.tsx:101` uses `<video autoPlay>` with no `poster`/`preload`, fetching `public/demo-typography.mp4` (2.57 MB) unconditionally on route entry. Add `poster` + `preload="none"` or click-to-play; consider a hosted/streamed source.
- **MR-10 — `optimizePackageImports: ["motion"]` is likely a no-op.** All usage imports from `motion/react`, but the barrel optimization keys on the import specifier. Add `"motion/react"` and verify the emitted bundle tree-shakes.
- **MR-11 — No structured logging; cron failures don't reach Sentry.** ~17 ad-hoc `console.warn/error` sites, no levels/correlation IDs/JSON. The cron's own failure summary (`route.ts:180`) goes only to the JSON response and best-effort fire-and-forget `pingStudio` (which swallows all errors); it never reaches Sentry. Add a small structured logger and forward cron failures to Sentry.
- **MR-12 — Sentry `environment` defaults to `"development"` in prod if unset.** `instrumentation.ts:28,38` / `instrumentation-client.ts:13` — a forgotten `SENTRY_ENVIRONMENT` in Vercel tags prod errors "development" and they may be filtered out of alerting.
- **MR-13 — Account deletion is not atomic across two DBs + Clerk.** `deleteAccountForUser` → two sequential Turso deletes, then Clerk `deleteUser`. A failure between steps leaves partial state (idempotent on retry, but there's no reconciliation). Acceptable given idempotency; document the ordering guarantee.
- **MR-14 — Destructive account-delete rate limit fails open.** `ratelimit.ts` fails open on Redis outage by design; for the irreversible delete endpoint consider a secondary control or fail-closed with a clear error.
- **MR-15 — `isAuthError` substring matching over-drops the Tasks client.** `tasks-db-source.ts` treats any error string containing `"auth"`/`"token"`/etc. as an auth failure and nulls the cached client, defeating the connection cache on benign messages. Inspect a structured error code instead.

---

## Low-risk polish

- **LP-1** — Dead hero components `analytics-hero-signal.tsx` (~836 lines) and `analytics-hero-loader.tsx` (~455 lines) are imported nowhere. Not shipped, but `analytics-hero-signal.tsx:295-329` contains an infinite self-restarting rAF/timer loop with no visibility gating — port `IntersectionObserver` gating if ever revived.
- **LP-2** — `SuiteLoader.tsx` is unused dead code and reads `window.matchMedia().matches` during render (hydration-mismatch hazard if mounted).
- **LP-3** — `AnalyticsDemo` re-renders the whole briefing subtree per typed character (`analytics-demo.tsx:195`); bounded by on-screen gating but heavy. Isolate the typing reveal into a leaf.
- **LP-4** — Client `console.error` dumps the full error object to the end-user's browser console (`app/error.tsx:19`, `app/app/error.tsx:18`) — UI copy stays generic, but the raw object (stack/message) is exposed.
- **LP-5** — Email greeting hardcodes "Good morning" for all recipients (`voice.ts:20`) because cron is 06:00 UTC-only; wrong for non-EU until per-TZ scheduling.
- **LP-6** — Email→user join uses `WHERE email = ? LIMIT 1` with no uniqueness guarantee on `email`; duplicate emails bind arbitrarily.
- **LP-7** — `resolveEntitlement` silently ignores DB tiers absent from `TIER_RANK` (`reads.ts:68`), potentially downgrading to free on schema drift — no log.
- **LP-8** — Git hooks are opt-in and non-gating (`.githooks/pre-commit` unconditionally `exit 0`s); all real gating relies on CI.
- **LP-9** — Isolation-test docblock says it scans `src/server`, but it actually scans all of `src/` (broader = safer). Stale comment only.
- **LP-10** — No `next/image` usage anywhere yet; fine today (only inline SVG + the one video), but route future raster imagery through it.

---

## Future architecture recommendations

1. **Resolve the database sprawl.** Four Turso DBs with inverted naming is the root of several findings. Either (a) consolidate the two analytics DBs (`user_preferences` has no reason to be separate from `analytics_users`), or (b) at minimum rename so the names describe contents, document each in `env.ts` + `.env.example`, and put all under managed migrations. A single user's state living in two DBs with no cross-DB transaction is a lasting correctness tax.
2. **Reconsider Postgres/Supabase for real RLS.** The brief assumed Supabase; the app has none. SQLite/Turso can't enforce tenant isolation at the data layer, so a single missing `WHERE` is an unbounded cross-tenant leak caught only by a grep-based test. If the product will hold millions of users' work data, RLS (or an equivalent enforced query layer) is the highest-value security investment available.
3. **One briefing pipeline.** Collapse `/app` (`buildBriefingForUser`) and `/app/brief` + cron (`buildBriefing` + `getBriefingSource`) onto a single orchestrator that always threads read-state. This fixes BL-1, MR-2, and the two-data-paths divergence in one move.
4. **A real email job system.** Replace the single 60s daily cron with a queue (QStash/Inngest) or Resend batch sends, with per-recipient retry and dead-lettering, so throughput scales past ~100 users and the tail can't starve.
5. **Delete the dead engine.** Remove `src/lib/triggers/**` and `src/lib/prose/**` (or promote them). Two divergent implementations of the product's core logic is a maintenance trap.
6. **A caching layer for the deterministic daily briefing.** The briefing is a pure function of (user, day, data snapshot). Cache it; stop rebuilding + writing on every page render.

---

## Refactoring opportunities

- Extract a **tenant-scoped query helper** that injects `clerk_id` so isolation is structural, not per-call-site discipline (belt to the isolation test's braces).
- Consolidate the **two lane-mapping implementations** (`build-for-user.ts` inline vs `tasks-db-source.ts::canonicaliseLane`) into `data/source.ts`.
- Introduce a **structured logger** and replace the ~17 `console.*` sites.
- Remove the `as unknown as TriggerId` cast (HR-7) by aligning the enums or deleting the rotation writes.
- Deduplicate the **two briefing entry pages** rendering `BriefingView` via different builders.

---

## Security recommendations (ranked)

1. Promote CSP to **enforce** and remove `'unsafe-inline'` from `script-src` via nonces (HR-3).
2. Make the **production/demo decision server-only** and refuse demo mode when prod DB creds are present; test the invariant (HR-4).
3. Add **`surfaced_items` to the isolation guard** (MR-3) and add tests for the access-gate/access-mode/PII-scrub trio (HR-9).
4. Move the closed-beta allowlist off the **hardcoded founder email** toward an env/invite system; document `SIGNAL_ALLOWLIST` (HR-10, LP).
5. Consider **fail-closed** for the irreversible account-delete rate limit (MR-14).
6. Long-term: **RLS** (Future Architecture #2).

*Already solid: constant-time cron-secret comparison, read-only Turso token on the Tasks DB, side-effect-free `/u/[token]` GET, Sentry PII scrubbing + `sendDefaultPii:false`, `frame-ancestors 'none'` + enforced HSTS/XFO/nosniff.*

## Performance recommendations (ranked)

1. **Static-render the marketing site** by moving `auth()` out of the root layout (HR-8) — biggest TTFB/cost win.
2. **Cache the daily briefing** per user and move DB writes out of the GET render path (MR-4).
3. **Batch** entitlements (`IN (...)`) and Clerk lookups in the cron; fold the tasks id-lookup into the tasks query (HR-2/N+1).
4. **Bound Tasks reads by relevance** and add indexes; fix the `LIMIT 200 ORDER BY id` relevance bug (MR-5).
5. `poster`/`preload="none"` on the demo video (MR-9); verify `motion/react` tree-shaking (MR-10).

---

## Master ranked list — highest to lowest impact

| # | ID | Severity | Issue | Primary fix |
|---|----|----------|-------|-------------|
| 1 | BL-1 | Blocker | Emailed briefing ignores dismissals + aging (paid surface) | Route cron through `buildBriefingForUser` |
| 2 | BL-2 | Blocker | One-click unsubscribe broken for all but latest email; reports false 200 | Durable unsubscribe lookup + honest status |
| 3 | HR-1 | High | Entitlement-DB outage → silent mass non-delivery, reports green | Use `resolveEntitlementOrThrow` + log + warn |
| 4 | HR-6 | High | Only 1 of 4 DBs under migration management; hand-applied schema | Managed migrations per DB + deploy step |
| 5 | HR-4 | High | Site-wide auth bypass via client-readable `NEXT_PUBLIC` flag | Server-only mode decision; test invariant |
| 6 | HR-2 | High | Email fanout caps ~100 users; tail starves | Queue / batch send + batched lookups |
| 7 | HR-5 | High | CI has no `next build`; lint non-blocking; tests untyped | Add build gate; block lint; typecheck tests |
| 8 | HR-3 | High | CSP Report-Only + `unsafe-inline` | Enforce + nonces |
| 9 | HR-8 | High | Root-layout `auth()` de-optimizes entire static marketing site | Move auth to leaf/segment |
| 10 | HR-9 | High | No tests on auth/access/PII/delete modules | Add tests, auth trio first |
| 11 | HR-10 | High | Env config drift (`.env.example` vs boot-required vs `env.ts`) | `env.ts` as single source; validate all 4 DBs |
| 12 | HR-7 | High | Phrasing rotation disconnected + wrong-enum writes | Wire in or delete; remove unsafe cast |
| 13 | MR-2 | Medium | Web vs email briefings disagree (keys, priority, labels) | Unify pipeline (with BL-1) |
| 14 | MR-4 | Medium | No briefing caching; GET mutates DB | Cache daily brief; move writes out of render |
| 15 | MR-3 | Medium | `surfaced_items` missing from isolation guard | Add to `OWNER_TABLES` |
| 16 | MR-1 | Medium | Post-send write failure kills that email's unsubscribe | Persist token before/atomically with send |
| 17 | MR-6 | Medium | Two trigger/prose engines; only one live; thresholds drifted | Delete dead engine |
| 18 | MR-5 | Medium | `LIMIT 200 ORDER BY id` drops overdue items; unbounded `read()` | Order by relevance; filter done; add limit |
| 19 | MR-11 | Medium | Ad-hoc logging; cron failures skip Sentry | Structured logger; forward cron failures |
| 20 | MR-15 | Medium | `isAuthError` substring match over-drops Tasks client | Structured error codes |
| 21 | MR-7 | Medium | Broken CSS drops the long-wait fade | Move comment out of the value |
| 22 | MR-8 | Medium | `/app` loading violates documented loading law | Contain loader below chrome; dedupe Suspense |
| 23 | MR-9 | Medium | 2.5 MB autoplay video on `/demo` | `poster` + `preload="none"` |
| 24 | MR-10 | Medium | `optimizePackageImports` misses `motion/react` | Add subpath; verify tree-shake |
| 25 | MR-12 | Medium | Sentry env defaults to "development" | Fail loud if unset in prod |
| 26 | MR-13 | Medium | Account delete not atomic across DBs+Clerk | Document ordering; reconcile |
| 27 | MR-14 | Medium | Destructive delete rate-limit fails open | Consider fail-closed |
| 28 | LP-1..10 | Low | Dead components, hydration hazard, render churn, client error dump, greeting TZ, email uniqueness, tier drift, opt-in hooks, stale comment, no next/image | See §Low-risk polish |

---

## Approval decision

**Not approved for scale-to-millions launch as-is.** Clear BL-1 and BL-2 (both correctness/compliance on the paying surface), and HR-1 (silent revenue-affecting failure) before any paid launch. HR-2/HR-6/HR-5/HR-3/HR-4 should be closed before "millions" scale is credible. The remaining High/Medium items are strongly recommended fast-follows.

For a **closed-beta continuation** (current posture: allowlist-gated, small list), the blockers are narrower — BL-2 (deliverability/legal) and HR-1 still matter, but the scaling and static-render items can wait. Match the fix set to the actual launch definition.

*Per AGENTS.md Signal HQ sync: the risks surfaced here (esp. BL-1, BL-2, HR-1) should be reflected in the Studio repo's `content/hq/risks/` — that repo is out of scope for this session and is flagged as follow-up.*
