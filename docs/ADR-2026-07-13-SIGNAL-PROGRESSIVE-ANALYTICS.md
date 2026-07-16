# ADR · Signal progressive analytics

- **Date:** 2026-07-13
- **Status:** Accepted. Implementation is feature-flagged and not a production launch claim.
- **Owners:** Signal product and application architecture
- **Supersedes:** The conflicting parts of `docs/PRODUCT.md` that required four briefing blocks, limited Signal to Tasks-only reads, or prohibited every chart, metric card, and bounded customization action.

## Decision

Signal will keep Briefing as its default and add three layers beneath it:

1. Briefing. Zero to three things that genuinely need the user now.
2. Overview. The current state of the selected workspace or project.
3. Trends. One focused question about change over time.
4. Evidence. The rule, comparison, coverage, and permitted source records behind a claim.

This is one Signal product surface, not a generic dashboard beside it. Scope, period, filters, selected metric, and Evidence state use the existing authenticated application and shareable URL state. Recommended content appears before customization.

## Repository architecture decision

The inspected Signal repository is a Next.js 16 and React 19 application, not a WordPress installation or plugin. It already owns the authenticated Signal shell, Clerk session, a small Signal Turso database for preferences and briefing state, and a read-only Tasks Turso connection. Progressive analytics therefore lives inside this application. Introducing a WordPress plugin would create a second authentication, routing, data, and design system with no canonical source in this repository.

The first-party module boundaries are:

- `src/lib/analytics/` for UI-safe contracts, normalized records, timezone-safe date semantics, scope filtering, deterministic metrics, coverage-bounded trend series, observation rules, ranking, URL state, preferences, and explicit test fixtures. The domain is split across `contracts.ts`, `time.ts`, `scope.ts`, `metrics.ts`, `trend-series.ts`, `rules.ts`, `url-state.ts`, `preferences.ts`, and `fixtures.ts`, with `index.ts` as its public barrel, rather than a monolith.
- `src/server/analytics/` for feature gating, query validation, membership policy, provider adapters, response assembly, preferences, and private response handling. `service.ts` assembles Briefing, Overview, Trends, and Evidence; `route.ts` applies the shared HTTP receipt and error contract.
- `src/app/api/signal-studio/v1/` for versioned authenticated HTTP controllers.
- `src/components/signal/` plus the `src/app/app/(signal)/` route group for the integrated Briefing, Overview, Trends, URL context, loading and error states, and the Evidence drawer.

No analytics business rule belongs in a marketing component. The route integration is implemented: `/app` is the progressive Briefing when the flag is enabled, `/app/overview` and `/app/trends` provide the deeper views, and the legacy `/app/brief` URL preserves its query state while redirecting to `/app`. When the flag is disabled, `/app` renders the existing Briefing and the deeper routes remain unavailable. The email path stays on its existing Briefing contract; it has not been silently converted into an analytics dashboard.

## Data flow

1. A request enters through the existing Clerk-authenticated Signal application.
2. The controller validates and bounds scope, period, timezone, owner, status, metric, breakdown, and pagination.
3. Policy revalidates workspace membership against the canonical Tasks workspace on every request. Project and user scopes remain inside that workspace boundary.
4. Provider adapters read only the source fields needed from Notes, Tasks, Timeline, and project context. Missing providers return coverage state, not an empty success.
5. The analytics domain normalizes timestamps, dates, terminal states, meaningful activity, blocking, ownership, decisions, milestones, and source links.
6. Versioned metrics calculate deterministic results. Versioned observation rules detect, combine, suppress, and rank candidates.
7. Briefing returns zero to three candidates. Overview and Trends reuse the same facts and metric definitions. Evidence returns only permitted contributing records.
8. The client renders the response and links actions back to existing Notes, Tasks, and Timeline routes. Signal does not create duplicate editors.

The analytics layer does not store raw Note bodies or shadow copies of Notes, Tasks, decisions, or milestones.

## Permission flow

Authentication and beta access are necessary but not sufficient. Each request must also pass live workspace membership validation. Project scope must belong to the authorized workspace. User scope may only select the signed-in user unless a future, explicit role policy says otherwise.

Evidence is filtered at source-record level. A count must not imply hidden record titles or private Note content. Demo and review modes may use explicit fixtures; production must never fall back to fixtures when a provider is unavailable.

Mutation requests for card preferences require the same authenticated principal plus a same-origin check. A nonce, Origin header, or browser session is request protection, not authorization by itself.

## Metrics and coverage

Metric definitions are centralized and versioned. The initial catalogue is work completed, open and overdue work, open-work age, stalled work, blocked work, unowned work, completion pace change, milestone movement, open decisions, follow-up completion, workload distribution, and cross-product milestone risk.

The initial identifiers are `signal-analytics-metrics@1.0.0` and `signal-analytics-rules@1.0.0`. Responses expose these identifiers so behavior can be compared across releases without inferring the code revision.

Every result carries:

- scope and period
- calculation time and timezone
- metric or rule version
- comparison basis where used
- source counts or contributing records
- provider coverage and freshness
- an explicit `insufficient_history`, `partial`, `stale`, `unavailable`, or `unsupported` state when applicable

The interface never converts missing coverage into zero and never interpolates historical values.

## Historical-data strategy

Use canonical events and completion timestamps first. The current Tasks compatibility path may use the canonical completion timestamp where a terminal transition history is absent; the Evidence response must disclose that basis.

Milestone movement is available only when Timeline has stored prior dates. Completion pace requires the current period plus three comparable prior periods. Trend buckets must fit wholly inside the provider's successfully queried history window; uncovered time is never zero-filled. When comparable coverage is incomplete, Signal says **Not enough history yet**. When the current provider is unavailable, the status remains `unsupported` and the interface says the value is unknown instead of relabelling the outage as sparse history.

The implementation adds one isolated, additive Drizzle migration stream at `drizzle-signal/` for prospective analytics state:

- `analytics_view_preferences` stores card identifiers and order per Clerk user and workspace.
- `analytics_metric_snapshots` stores versioned numeric or aggregate metric values, workspace or project scope, source coverage, and snapshot time.
- `analytics_snapshot_runs` records bounded run state, source watermark, coverage, and safe error code.
- `analytics_schema_versions` records the progressive-analytics schema version.

These tables do not store source titles, raw Note bodies, or canonical records. The initial migration is idempotent, indexed for workspace, project, metric, and time filters, and contains no destructive statement. Snapshots are prospective and cannot be used to invent the past. Canonical events and completion timestamps remain the first source for history.

The forward snapshot writer is implemented in `src/server/analytics/snapshots.ts` and exposed only through `/api/cron/signal-analytics`. Vercel invokes it once daily at **02:30 UTC** (`30 2 * * *`), which is compatible with the current Hobby plan. Each invocation requires `Authorization: Bearer <CRON_SECRET>`, performs the global retention sweep, and suppresses new captures when the analytics feature is disabled. An authenticated manual invocation may continue with the next eligible batch during release proof or backfill; preview deployments do not run Vercel cron automatically.

Eligibility is explicit: a workspace must be linked from a Signal analytics user, at least one linked Clerk subject must still resolve to a current owner or member in the canonical Tasks store, and the workspace must not already have a completed or active receipt for the current UTC day. Eligible workspaces are de-duplicated and ordered by oldest successful capture, with never-captured workspaces first. Each invocation processes a bounded batch of 20 workspaces by default, configurable through `SIGNAL_ANALYTICS_SNAPSHOT_BATCH_SIZE` and hard-capped at 25; the 60-second route stops starting new work after approximately 50 seconds. Authenticated manual invocations continue with remaining eligible workspaces because completed and recently running daily receipts are excluded from selection. The oldest-first order persists fairness across UTC-day receipt resets, so a tenant count above one day's batch capacity does not permanently starve later workspaces, though those tenants receive snapshots less frequently until another scheduler or a higher Vercel plan is justified by measured demand.

The receipt identifier is stable per workspace, UTC day, and metric version. A completed receipt blocks duplicate capture. Failed receipts may be retried, and a `running` receipt becomes recoverable after a **10-minute stale lease**, preventing an abandoned invocation from blocking that workspace for the rest of the day. Each successful capture writes workspace aggregates plus at most 50 project scopes from the canonical Tasks and Timeline providers, without source titles, source identifiers, Note bodies, or record payloads.

Snapshots are prospective only. They supplement canonical events and completion timestamps; they do not backfill or invent historical values. User-scoped and owner/status-filtered historical queries do not read an aggregate snapshot as though it represented the filtered population. Notes are intentionally excluded from background snapshots until their canonical structured fields and permission-safe provider contract exist. Trends returns insufficient, partial, unavailable, or unsupported coverage whenever the available history cannot answer the selected question.

## Privacy, retention, and erasure

`analytics_view_preferences` is the only new user-identifiable analytics table in this pass. It stores Clerk user ID, workspace ID, card identifiers, and order. The existing account export includes these preferences, and account erasure deletes them before the Signal account row is removed.

Metric snapshots and run receipts are workspace-scoped aggregates. Their schema excludes source titles, source identifiers, raw Note bodies, and record payloads. Every authenticated snapshot-cron invocation performs a **global 400-day retention sweep** across metric snapshots and run receipts, including rows for deleted or no-longer-linked workspaces; successful captures also retain a scoped cleanup as defense in depth. The global sweep runs before the feature gate, so derived history continues to age out when capture is disabled, provided the authenticated Vercel schedule remains active. Rollback leaves the additive tables in place, never deletes canonical source data, and never performs a destructive schema reversal.

## Cache and invalidation

The first release treats analytics HTTP responses as private. Controllers are dynamic Node.js routes and send `Cache-Control: private, no-store` with `Vary: Cookie, Authorization`. Analytics reads expose measured `Server-Timing`. Preferences also exposes `X-Signal-Query-Count: 1` because that path has one known Signal-state database call; the other controllers do not claim an unmeasured query count. Responses vary by authentication and must not enter a shared public cache. Request-local reuse is allowed.

A later persistent cache must include site or environment, workspace, project, user-permission scope, period, filters, metric version, and rule version in its key. It must invalidate when relevant Tasks, Notes, decisions, owners, dependencies, dates, milestones, or source coverage change. Until those invalidation hooks are proven, correctness wins over a broad cache.

## Narrative-provider boundary

Metrics, candidate selection, ranking, comparison, confidence, and Evidence remain deterministic. Curated templates are the default and required fallback.

An existing server-side narrative abstraction may later rephrase verified facts or summarize the bounded Evidence payload. It cannot calculate a metric, invent causality, select a candidate, bypass permissions, receive provider keys in browser code, or turn partial coverage into confidence. Failure, timeout, invalid output, missing consent, or missing configuration returns deterministic wording.

Signal is never marketed through its narrative-provider mechanism.

## Product behavior

The integrated application surface is implemented in the existing authenticated shell. Briefing is `/app`, Overview is `/app/overview`, and Trends is `/app/trends`. All three use the same canonical URL-state parser for workspace or project scope, period, owner and status filters, selected metric and breakdown, view pagination, and independently paginated Evidence state. The shared Evidence drawer is mounted from each view rather than creating a parallel record editor.

### Briefing

- Default Signal view.
- Zero to three ranked observations across the selected scope.
- No filler observation.
- Healthy state: "Nothing needs you right now. Work is moving normally."
- Each observation opens the shared Evidence drawer and offers one useful primary action.

### Overview

- Automatically composed for workspace or project scope.
- Bounded summary, comparable project rows, one primary trend, and an actionable queue.
- Cards appear only when data and context justify them.

### Trends

- One selected metric and one primary visualization.
- Four-week, twelve-week, six-month, and twelve-month periods.
- Plain-language interpretation, comparison basis, breakdown, source records, freshness, and coverage.
- "Not enough history yet" instead of a confident empty chart.

### Evidence

- One consistent right-side drawer.
- Shows what surfaced, why, deterministic rule, comparison basis, records, actions, scope, period, freshness, coverage, and version.
- Escape closes it, focus moves in and returns to the trigger, and the background is hidden correctly from assistive technology.

### Customization

- Normal mode: consume, inspect, filter, open Evidence, act.
- Customize mode: hide, pin, reorder, restore recommended defaults.
- Store only card identifiers and order in the Signal-state database's dedicated analytics preference table.

## API contract

The versioned controller surface is:

- `GET /api/signal-studio/v1/briefing`
- `GET /api/signal-studio/v1/overview`
- `GET /api/signal-studio/v1/trends`
- `GET /api/signal-studio/v1/evidence/{observationId}`
- `GET /api/signal-studio/v1/preferences`
- `PATCH /api/signal-studio/v1/preferences`

Common bounded query fields are `scope_type`, `scope_id`, `workspace_id` where needed, `period`, `start`, `end`, `timezone`, `owner`, `status`, `metric`, `breakdown`, `page`, and `per_page`. Custom ranges may not exceed 366 days. Evidence and record lists paginate over the full bounded, authorized provider result; Briefing and drawer observation previews remain capped at 100 inline records without reducing the pageable total. Error responses use one stable private shape and never include source content in logs.

## Setup

1. Install the repository's existing dependencies. Do not add a second framework or state library.
2. Configure Clerk and the existing Signal and Tasks Turso variables as documented by the repository.
3. Apply the additive Signal-state migration in local or staging with `npm run db:signal:migrate`. Run `npm run db:signal:contract` first to verify the migration remains additive and content-minimizing.
4. Set `SIGNAL_ANALYTICS_V1_ENABLED=true` only in the local or staging environment being reviewed. Production defaults off.
5. Set `CRON_SECRET` in the review environment before invoking `/api/cron/signal-analytics`. Vercel supplies the configured secret as a Bearer token to the scheduled route; local/manual invocations must do the same.
6. Use demo or review fixtures only through the repository's explicit access mode. Never insert them into production databases.

## Release safety

The release gate is centralized in `src/server/analytics/feature-flag.ts`. An explicit false disables the feature. An unset production flag is disabled. Do not scatter environment checks through routes and components.

Release sequence:

1. Keep the flag off in production.
2. Verify domain and HTTP tests with fixtures, including healthy, sparse-history, stale, provider-failure, unauthorized, and 150-record evidence-pagination cases.
3. Verify a live staging workspace with at least one inaccessible project and inspect every Evidence link.
4. Complete keyboard, focus, mobile, and reduced-motion checks.
5. Measure request time, query count, and production bundle change. Record the measured values; do not infer them.
6. Enable only for the approved staging or beta cohort.
7. Promote beyond beta only after live tenant isolation and source-action checks pass.

Rollback is immediate: set `SIGNAL_ANALYTICS_V1_ENABLED=false`. The original Briefing path and canonical source data remain intact. Disabling the flag does not delete data or reverse migrations. The additive analytics tables remain dormant so rollback is non-destructive.

## Verification commands

Use the repository's existing commands:

```text
npm run typecheck
npm test
npm run lint
npm run ds:check
npm run db:contract
npm run db:signal:contract
npm run build
```

Add focused analytics tests to the existing Node test setup. Browser and screenshot checks belong in the existing Signal test approach; do not add a large test framework solely for this feature.

Current automated evidence on the implementation branch:

- `npm test` passes **271 of 271 tests** across the repository contract checks, tenant-scope guard, analytics domain and server tests, existing Briefing and Planning Period tests, suite-context tests, preference origin policy, fair snapshot continuation, provider-outage semantics, coverage-bounded trend series, and account export/erasure coverage.
- `npm run db:signal:contract` passes the additive, content-minimizing migration contract.
- `npm run typecheck`, changed-file ESLint, `npm run ds:check`, `npm run db:contract`, and `npm run build` pass locally. The optimized Next.js 16.2.4 build produces all Signal application and API routes.
- A local production-server browser pass covers Briefing, healthy empty state, workspace and project Overview, Trends, 150-record Evidence pagination, provider failure, insufficient history, Customize mode, URL context, drawer focus/Escape return, tablet, and 320px mobile. It reports no browser console errors and the happy-path requests observed in that pass return 200.
- These local receipts are not a claim that live Clerk authentication, real staging tenant isolation, the deployed scheduler, provider credentials, or production have passed. Those release gates remain open.

## Known release risks

- Notes currently has no workspace/project fields or structured decision state. The approved-extract adapter can expose linked follow-ups through a promoted Task, but open-decision metrics and direct Note actions remain unsupported until canonical structured fields and permission-safe deep links exist. Raw Note bodies stay excluded.
- Timeline movement requires stored activity and prior-date history. An environment without that history returns unsupported or partial coverage; Signal never derives a previous date from the current milestone.
- Tasks currently treats tags as project identity. Project authorization and URL state must use the same canonical mapping until the suite adopts a different shared object.
- Completion timestamps do not equal full transition history. Evidence must name the fallback.
- Completion pace requires three fully covered comparable periods; anything less returns insufficient history.
- The daily-per-workspace snapshot writer and Hobby-compatible daily schedule exist in code, but no live deployment receipt yet proves that the scheduler, `CRON_SECRET`, Signal-state migration, Tasks provider, and Timeline provider work together in the target environment. Keep the feature on hold until a scheduled receipt and an authenticated continuation invocation are observed.
- Snapshot history begins only after successful forward captures. It does not repair prior gaps, does not currently include Notes, and deliberately declines user- or owner/status-filtered aggregate history.
- A private response cache is intentionally deferred until event-driven invalidation and permission-sensitive keys are proven.
- Sibling Tasks, Notes, and Timeline deployments must consume the agreed suite-context contract before cross-product navigation can be called end-to-end complete in production.
- The branch, routes, scheduler configuration, and feature flag are implementation state, not proof of a production release. No production deployment is authorized by this ADR.
