# Demo / Review Mode — Signal

Signal ships the suite-wide **access-mode** layer so the daily briefing can be
reviewed during development without weakening production auth. Suite-level
rationale: `studio/docs/DEMO_REVIEW_MODE.md`.

## Four modes

`SIGNAL_ACCESS_MODE` (server) + `NEXT_PUBLIC_SIGNAL_ACCESS_MODE` (client):

| Mode | Auth | Data |
|------|------|------|
| `production` | Real Clerk session required | Real Tasks Turso DB join |
| `development` | Keyless dev bypass (existing) | Real DB / empty source |
| `demo` | **No login wall on /app** | **In-memory mock signals** |
| `review` | Same as demo | Same as demo |

Default when unset: `production` under `NODE_ENV=production`, else `development`.

## Safety invariant

Demo/review never query the real DB. `/app` skips the auth + workspace gate
and `buildBriefingForUser` short-circuits to the in-memory `mockBriefingSource`
(the Wedding 2026 demo) through the *real* `buildBriefing` engine. No workspace
lookup, no rotation read/write — no `db` call on the demo path. The briefing
reads exactly as it will in production; only the signals are synthetic.

## Enable / disable

```bash
cp .env.example .env.local   # set both vars to demo (or review)
npm run dev
```
Preview deploy: set both env vars to `demo`/`review`. No Clerk/Turso keys
required to render `/app`. Restore production auth by setting both back to
`production` (or unsetting — production is the default in a prod build).

## Review routes

- `/app` — the daily briefing (mock Wedding 2026 signals)
- `/signal`, `/method`, `/pricing` — marketing surface (already public)
- `/wedding-planning` — shared-briefing example (already public)

Suite hub: `https://signalstudio.ie/review`.

## Remaining technical debt

- Onboarding (`/app/onboarding`) and settings still target the DB; in demo the
  briefing is the reviewable surface and the onboarding gate is skipped.
- Feedback actions on the briefing write to the DB via Clerk; inert in demo.
