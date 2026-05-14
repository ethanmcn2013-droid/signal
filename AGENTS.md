# AGENTS.md — Signal Analytics

This repo is part of the Signal Studio suite. Signal Analytics is the attention-clarity product.

## Signal HQ Sync

Signal HQ lives in the Studio repo at `ethanmcn2013-droid/studio` and is the internal source of truth for product, launch, growth, decisions, risks, metrics, and next actions.

When a change in Analytics affects product state, roadmap, launch readiness, GTM, messaging, campaigns, demos, templates, outreach, pilots, metrics, decisions, risks, or strategic learning, update Signal HQ before the task is complete.

Before briefing, signal, sharing, guest-facing, source-tracking, or cross-product data work, read `docs/COLLABORATION_LOOP.md`. Analytics owns the attention and briefing moment in the collaboration loop.

In practice, open or update a Studio PR that changes:

- `src/lib/hq/data.ts`
- `src/lib/hq/signals.ts` if derived signal logic changes
- relevant files under `signal-growth/`
- `CHANGELOG.md` for meaningful operator-visible changes — write entries in the dispatch shape (Studio BRAND.md §6.5): `## YYYY-MM-DD · A·NN · verb · headline`, then a bold impact-lead sentence, then prose. Verbs are `ships / tightens / cuts / holds / reads`.

Also bump `seedHqData.updatedAt` so `/hq` can detect newer repo-backed data.

## Voice

Use plain language. Avoid project-management jargon and avoid marketing any ambient automation as an AI feature.
