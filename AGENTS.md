# AGENTS.md - Signal

This repo is part of the Signal Studio suite. Signal is the attention-clarity
product.

## Signal HQ Sync

Signal HQ lives in the Studio repo and is the internal source of truth for
product, launch, growth, decisions, risks, metrics, and next actions.

When a change in Signal affects product state, launch readiness, GTM, messaging,
campaigns, demos, templates, outreach, pilots, metrics, decisions, risks, or
strategic learning, update Signal HQ before the task is complete.

Before briefing, signal, sharing, guest-facing, source-tracking, or cross-product
data work, read `docs/COLLABORATION_LOOP.md`. Signal owns the attention and
briefing moment in the collaboration loop.

Open or update a Studio PR that changes the canonical source file:

- feature scope, status, or impact: `content/hq/features/<id>.md`
- risk surfaced or mitigation changed: `content/hq/risks/<id>.md`
- decision affecting pricing, brand, GTM, or product: `content/hq/decisions/<id>.md`
- campaign goal, blocker, or progress: `content/hq/campaigns/<id>.md`
- cross-product flow, data shape, or cron schedule: `content/atlas/<slug>.md`
- growth learning: relevant files under `signal-growth/`
- shipped operator-visible change: `CHANGELOG.md`

Do not update `src/lib/hq/data.ts` unless the live Studio code path still reads
from it. The markdown and typed source files above are canonical for migrated HQ
sections.

## Voice

Use plain language. Avoid project-management jargon and avoid marketing any
ambient automation as an AI feature.
