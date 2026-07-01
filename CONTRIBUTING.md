# Contributing to Signal

Quick notes on how the codebase fits together and the few traps
worth knowing before your first commit lands.

## Running tests

```bash
npm test            # 119 tests in ~500ms
npm run test:coverage   # same + Node built-in coverage report
```

The runner is `node --test` via `tsx`. **No** Jest, **no** Vitest —
the engine is pure functions and the email render path is
side-effect-free, so the built-in runner is the right tool.

The test command uses `--env-file-if-exists=.env.local` so it loads
your local secrets. Without this, `src/lib/db/index.ts` throws at
import-time because it requires `TURSO_ANALYTICS_DATABASE_URL`.

## Trap 1: `import "server-only"` and Node tests

The `server-only` npm package **throws unconditionally** when
imported in a non-RSC context. That includes Node's test runner.

Next.js handles this via webpack alias during build — it remaps
`server-only` to an empty stub. Outside the Next.js build, you
crash at module load.

**What we do:**
- Modules that are ONLY imported from route handlers / server
  actions (e.g. `src/lib/email/dispatch.ts`) had their
  `import "server-only"` removed. The framework boundary already
  enforces server-only via the cascading "use client" / "use server"
  rules.
- Modules that need stronger isolation (e.g. `src/lib/preferences.ts`,
  `src/lib/db/index.ts`) keep the import and aren't tested
  directly — their behavior is exercised through other code paths
  that mock the data layer.

**Rule of thumb:** if a module is going to need a unit test, don't
`import "server-only"` from it. If a module must enforce server-only
boundaries (touches secrets, DB, Clerk), keep the import and test
its callers instead.

## Trap 2: `pnpm-lock.yaml`

A stray `pnpm-lock.yaml` keeps appearing in the working tree. We're
an npm project (`package-lock.json` is the canonical lockfile).
Vercel's package-manager auto-detection sees `pnpm-lock.yaml` and
switches to pnpm mid-deploy, which then fails.

**Before every `vercel deploy --prod`:** `rm -f pnpm-lock.yaml`.

If you can find what's writing that file, please fix or document
its source.

## Architecture quick map

```
src/lib/briefing/
  types.ts          Briefing, BriefItem, TaskSignal, TriggerKind, etc.
  source.ts         BriefingSource interface + BriefingContext
  mock-source.ts    Wedding 2026 demo signals (dev + preview only)
  tasks-db-source.ts  Read-only join into Tasks Turso DB by email
  get-source.ts     Runtime factory — real source if env set, else empty
  triggers.ts       6 v1 trigger detectors (stuck-work, due-soon, etc.)
  prose.ts          3 phrasings × 6 triggers, rotated per (user, day)
  build.ts          buildBriefing(source, ctx, now) — pure function

src/lib/email/
  briefing-email.tsx  React Email render
  plain-text.ts       Plain-text alternative for multipart/alternative
  dispatch.ts         Resend wrapper with token rotation + DI seam
  tokens.ts           24-char nanoid unsubscribe tokens

src/app/
  app/                Auth-gated routes (Clerk via src/proxy.ts)
    layout.tsx        Suite-launcher chrome
    brief/            In-app briefing surface
    settings/         Notification cadence + Send-test
    preview-email/    Sandboxed iframe of actual email render
  api/
    cron/briefings/   Bearer-auth fanout (Vercel cron, 0 6 * * *)
    unsubscribe/      RFC 8058 one-click POST + GET handler
  u/[token]/          Public "You're off" landing
```

## Conventions worth keeping

- **Brand promise: no email on empty days.** `dispatchBriefing`
  refuses to send when `briefing.isEmpty`. Don't paper over this
  to keep cadence consistent — it's load-bearing.
- **Token rotates on every successful send.** Old emails' unsubscribe
  links should die when a new one ships. This is the test in
  `dispatch.test.ts` you don't get to weaken.
- **All headers asserted in tests.** `List-Unsubscribe`,
  `List-Unsubscribe-Post: List-Unsubscribe=One-Click`, `List-Id`,
  `Reply-To`. A future refactor that drops any of these breaks Gmail's
  native unsubscribe — your test should catch it.
- **Per-day rotation is deterministic.** Same user, same day → same
  phrasing. If you change the rotation algorithm, the determinism
  tests in `build.test.ts` will catch you.

## Voice

Plain English. Never chart language ("87% of tasks…"). Never
percentages without an action. Read prose aloud — if it sounds like
a friend, keep it. The collaboration loop doc has the full rules.

The `prose.test.ts` includes a voice-rule guard that fails on `%`
or `kpi` characters in any phrasing output. Add similar guards if
you add a new banned-word category.
