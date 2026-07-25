# Truth model

`src/lib/design-lab/signal/authority.ts` owns a fixed clock, scope, claim cap, source coverage, receipts, role visibility, and fixture history. It serializes allow-listed DTOs; owner-only detail is filtered before it reaches the browser and raw Notes sentinel content is never serialized.

Quiet is valid only with healthy coverage. Stale, missing, failed, or partial sources produce degraded copy and never an unqualified all-clear.
