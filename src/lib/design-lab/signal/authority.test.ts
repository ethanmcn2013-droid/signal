import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

import type * as AuthorityModule from "./authority";
import type { LabOption, LabRole, LabScenario, SignalLabQuery } from "./types";

// `server-only` deliberately throws in a plain Node process. The production
// boundary remains real; this focused unit harness stubs only its zero-runtime
// marker before dynamically importing the authority under test.
const require = createRequire(import.meta.url);
const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = {
  id: serverOnlyPath,
  filename: serverOnlyPath,
  loaded: true,
  exports: {},
  children: [],
  paths: [],
} as NodeJS.Module;

type Authority = typeof AuthorityModule;
let authorityPromise: Promise<Authority> | undefined;

async function authority(): Promise<Authority> {
  authorityPromise ??= import("./authority").then((module) => {
    const transpiled = module as typeof module & { default?: Authority };
    return transpiled.default ?? module;
  });
  return authorityPromise;
}

async function query(
  overrides: Partial<Record<keyof SignalLabQuery, string>> = {},
): Promise<SignalLabQuery> {
  const { normalizeSignalLabQuery } = await authority();
  return normalizeSignalLabQuery({
    option: "A",
    surface: "briefing",
    scenario: "normal",
    role: "creator",
    uiState: "default",
    viewport: "desktop",
    scopeKind: "workspace",
    ...overrides,
  });
}

test("query normalization accepts route aliases and fails closed to known values", async () => {
  const { normalizeSignalLabQuery } = await authority();
  assert.deepEqual(
    normalizeSignalLabQuery({
      option: "c",
      surface: "scope",
      scenario: "partial-outage",
      role: "guest",
      state: "read_only",
      viewport: "390",
      scope: "planningPeriod",
    }),
    {
      option: "C",
      surface: "history",
      scenario: "outage",
      role: "guest",
      uiState: "read-only",
      viewport: "phone",
      scopeKind: "planning-period",
    },
  );
  assert.deepEqual(normalizeSignalLabQuery({ option: "unknown" }), {
    option: "A",
    surface: "briefing",
    scenario: "normal",
    role: "creator",
    uiState: "default",
    viewport: "desktop",
    scopeKind: "workspace",
  });
});

test("options A, B, and C receive identical claim and evidence truth", async () => {
  const { buildSignalLabView, getSignalLabEvidence } = await authority();
  const options: LabOption[] = ["A", "B", "C"];
  const snapshots = [];

  for (const option of options) {
    const labQuery = await query({ option });
    const view = buildSignalLabView(labQuery);
    snapshots.push({
      editionId: view.editionId,
      leadClaimId: view.leadClaimId,
      claims: view.claims.map((claim) => ({
        id: claim.id,
        block: claim.block,
        claim: claim.claim,
        whyItMatters: claim.whyItMatters,
        nextAction: claim.nextAction,
        receiptIds: claim.receiptIds,
      })),
      evidence: view.claims.map((claim) => {
        const evidence = getSignalLabEvidence(labQuery, claim.id);
        assert.ok(evidence);
        return evidence.receipts.map((receipt) => ({
          id: receipt.id,
          kind: receipt.kind,
          statement: receipt.statement,
          observedAt: receipt.observedAt,
          coverage: receipt.coverage,
          visibility: receipt.visibility,
        }));
      }),
    });
  }

  assert.deepEqual(snapshots[1], snapshots[0]);
  assert.deepEqual(snapshots[2], snapshots[0]);
});

test("every scenario compresses to at most three distinct claims", async () => {
  const { buildSignalLabView } = await authority();
  const scenarios: LabScenario[] = [
    "quiet",
    "normal",
    "dense",
    "edge",
    "stale",
    "outage",
    "first-day",
    "empty",
  ];
  const roles: LabRole[] = ["creator", "collaborator", "guest"];

  for (const scenario of scenarios) {
    for (const role of roles) {
      const view = buildSignalLabView(await query({ scenario, role }));
      assert.ok(view.claims.length <= 3, `${scenario}/${role} exceeded the cap`);
      assert.equal(new Set(view.claims.map((claim) => claim.id)).size, view.claims.length);
    }
  }

  const dense = buildSignalLabView(await query({ scenario: "dense" }));
  assert.equal(dense.inputEventCount, 428);
  assert.equal(dense.claims.length, 3);
  assert.ok(dense.suppressedCandidateCount > 100);
});

test("guest DTOs contain neither owner-only detail nor raw Notes bodies", async () => {
  const { buildSignalLabView, getSignalLabEvidence } = await authority();
  const guestQuery = await query({ role: "guest", scenario: "normal" });
  const view = buildSignalLabView(guestQuery);
  const serialized = [
    JSON.stringify(view),
    ...view.claims.map((claim) => JSON.stringify(getSignalLabEvidence(guestQuery, claim.id))),
  ].join("\n");

  assert.doesNotMatch(serialized, /OWNER_ONLY_SENTINEL/);
  assert.doesNotMatch(serialized, /RAW_NOTES_SENTINEL/);
  assert.equal(getSignalLabEvidence(guestQuery, "claim-access-drift"), null);

  const blocked = getSignalLabEvidence(guestQuery, "claim-capacity-blocked");
  assert.ok(blocked);
  assert.deepEqual(blocked.receipts.map((item) => item.id), ["receipt-capacity-status"]);
  assert.equal(blocked.redactedReceiptCount, 2);

  const creatorQuery = await query({ role: "creator", scenario: "normal" });
  const creatorEvidence = getSignalLabEvidence(creatorQuery, "claim-capacity-blocked");
  assert.ok(creatorEvidence);
  assert.doesNotMatch(JSON.stringify(creatorEvidence), /RAW_NOTES_SENTINEL/);
});

test("the state matrix exercises every source status", async () => {
  const { buildSignalLabView } = await authority();
  const statuses = new Set<string>();
  for (const scenario of ["normal", "stale", "outage"] satisfies LabScenario[]) {
    for (const source of buildSignalLabView(await query({ scenario })).sourceStates) {
      statuses.add(source.status);
    }
  }
  assert.deepEqual(
    [...statuses].sort(),
    ["failed", "fresh", "missing", "partial", "stale", "unsupported"],
  );
});

test("missing, failed, partial, or stale sources can never become a quiet day", async () => {
  const { buildSignalLabView } = await authority();
  for (const scenario of ["stale", "outage"] satisfies LabScenario[]) {
    const view = buildSignalLabView(await query({ scenario }));
    assert.equal(view.mode, "degraded");
    assert.equal(view.isQuiet, false);
    assert.match(view.headline, /incomplete/i);
  }
  const quiet = buildSignalLabView(await query({ scenario: "quiet" }));
  assert.equal(quiet.mode, "quiet");
  assert.equal(quiet.isQuiet, true);
});

test("history editions are deterministic, newest-first, and deeply immutable", async () => {
  const { buildSignalLabView } = await authority();
  const first = buildSignalLabView(await query());
  const second = buildSignalLabView(await query());

  assert.deepEqual(first.history, second.history);
  assert.deepEqual(first.history.map((edition) => edition.id), [
    "edition-2026-07-17",
    "edition-2026-07-16",
    "edition-2026-07-15",
  ]);
  assert.ok(Object.isFrozen(first));
  assert.ok(Object.isFrozen(first.history));
  assert.ok(Object.isFrozen(first.history[0]));
  assert.throws(() => {
    (first.history as unknown as unknown[]).push({});
  }, TypeError);
});

test("synthetic task preparation requires confirmation and is deterministic", async () => {
  const { prepareSyntheticTask } = await authority();
  const labQuery = await query({ option: "A" });
  const request = {
    claimId: "claim-capacity-blocked",
    confirmed: false,
  } as const;
  const preview = prepareSyntheticTask(labQuery, request);
  assert.equal(preview.status, "needs-confirmation");
  if (preview.status !== "needs-confirmation") return;

  const confirmed = prepareSyntheticTask(labQuery, {
    ...request,
    confirmed: true,
    idempotencyKey: preview.idempotencyKey,
  });
  const replay = prepareSyntheticTask(labQuery, {
    ...request,
    confirmed: true,
    idempotencyKey: preview.idempotencyKey,
  });
  assert.equal(confirmed.status, "prepared");
  assert.deepEqual(replay, confirmed);

  const optionC = prepareSyntheticTask(await query({ option: "C" }), {
    ...request,
    confirmed: true,
    idempotencyKey: preview.idempotencyKey,
  });
  assert.deepEqual(optionC, confirmed);

  const conflict = prepareSyntheticTask(labQuery, {
    ...request,
    confirmed: true,
    title: "Use changed task content",
    idempotencyKey: preview.idempotencyKey,
  });
  assert.equal(conflict.status, "conflict");
});

test("synthetic task preparation denies guests and read-only views", async () => {
  const { prepareSyntheticTask } = await authority();
  const input = {
    claimId: "claim-capacity-blocked",
    confirmed: true,
  } as const;

  assert.deepEqual(prepareSyntheticTask(await query({ role: "guest" }), input), {
    status: "denied",
    reason: "guest",
    message: "Guests cannot create Tasks from a shared briefing.",
  });
  assert.deepEqual(
    prepareSyntheticTask(await query({ uiState: "read-only" }), input),
    {
      status: "denied",
      reason: "read-only",
      message: "This lab view is read-only.",
    },
  );
});
