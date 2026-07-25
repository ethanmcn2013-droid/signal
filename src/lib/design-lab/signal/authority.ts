import "server-only";

import {
  LAB_OPTIONS,
  LAB_ROLES,
  LAB_SCENARIOS,
  LAB_SCOPE_KINDS,
  LAB_SURFACES,
  LAB_UI_STATES,
  LAB_VIEWPORTS,
  type LabCoverage,
  type LabOption,
  type LabRole,
  type LabScenario,
  type LabScopeKind,
  type LabSourceStatus,
  type LabSurface,
  type LabUiState,
  type LabViewport,
  type LabViewMode,
  type LabVisibility,
  type SignalLabClaim,
  type SignalLabEvidence,
  type SignalLabHistoryEdition,
  type SignalLabQuery,
  type SignalLabReceipt,
  type SignalLabScope,
  type SignalLabSourceState,
  type SignalLabView,
  type SyntheticTaskInput,
  type SyntheticTaskPreview,
  type SyntheticTaskResult,
} from "./types";

const DATASET_ID = "signal-lab-2026-07-18-v1" as const;
const GENERATED_AT = "2026-07-18T07:00:00.000Z";
const CLAIM_CAP = 3 as const;

// These deliberately alarming values prove that filtering happens before a
// DTO exists. Neither value is ever copied by the serializer. The raw Notes
// body is excluded for every role; the owner detail is available only to the
// creator after an explicit role check.
const OWNER_ONLY_SENTINEL =
  "OWNER_ONLY_SENTINEL supplier credit review belongs to the creator";
const RAW_NOTES_SENTINEL =
  "RAW_NOTES_SENTINEL private body: couple considering a confidential change";

type RawSource = SignalLabSourceState;

type RawReceipt = Omit<SignalLabReceipt, "detail"> & {
  detail?: string;
  ownerOnlyDetail?: string;
  rawNotesBody?: string;
};

type RawClaim = Omit<SignalLabClaim, "receiptIds" | "receiptCount" | "feedback"> & {
  receipts: readonly RawReceipt[];
};

type RawHistoryEdition = SignalLabHistoryEdition & {
  visibility: LabVisibility;
};

type ScenarioFixture = Readonly<{
  claims: readonly RawClaim[];
  sources: readonly RawSource[];
  inputEventCount: number;
  suppressedCandidateCount: number;
}>;

const WORKSPACE_SCOPE: SignalLabScope = {
  kind: "workspace",
  id: "workspace-harbour-house",
  label: "Harbour House opening",
};

const PLANNING_PERIOD_SCOPE: SignalLabScope = {
  kind: "planning-period",
  id: "period-autumn-opening",
  label: "Autumn opening period",
};

const FRESH_SOURCES: readonly RawSource[] = [
  {
    id: "tasks",
    label: "Tasks",
    status: "fresh",
    observedAt: "2026-07-18T06:58:00.000Z",
    coverage: "complete",
    statement: "Tasks is current through 06:58.",
  },
  {
    id: "timeline",
    label: "Timeline",
    status: "fresh",
    observedAt: "2026-07-18T06:54:00.000Z",
    coverage: "complete",
    statement: "Timeline is current through 06:54.",
  },
  {
    id: "notes",
    label: "Notes",
    status: "unsupported",
    observedAt: null,
    coverage: "not-used",
    statement: "Raw Notes bodies are intentionally excluded from Signal.",
  },
  {
    id: "provider",
    label: "Source provider",
    status: "fresh",
    observedAt: "2026-07-18T06:59:00.000Z",
    coverage: "complete",
    statement: "The fixture provider completed its latest read.",
  },
];

const STALE_SOURCES: readonly RawSource[] = [
  FRESH_SOURCES[0],
  {
    id: "timeline",
    label: "Timeline",
    status: "stale",
    observedAt: "2026-07-15T16:20:00.000Z",
    coverage: "partial",
    statement: "Timeline has not refreshed since Wednesday at 16:20.",
  },
  FRESH_SOURCES[2],
  FRESH_SOURCES[3],
];

const OUTAGE_SOURCES: readonly RawSource[] = [
  {
    id: "tasks",
    label: "Tasks",
    status: "missing",
    observedAt: null,
    coverage: "unavailable",
    statement: "Tasks did not return a snapshot, so today's work cannot be assessed.",
  },
  {
    id: "timeline",
    label: "Timeline",
    status: "failed",
    observedAt: "2026-07-17T18:00:00.000Z",
    coverage: "unavailable",
    statement: "Timeline failed during the latest read; its last receipt is not current.",
  },
  FRESH_SOURCES[2],
  {
    id: "provider",
    label: "Source provider",
    status: "partial",
    observedAt: "2026-07-18T06:59:00.000Z",
    coverage: "partial",
    statement: "The provider returned only part of the requested source set.",
  },
];

const FIRST_DAY_SOURCES: readonly RawSource[] = [
  {
    id: "tasks",
    label: "Tasks",
    status: "partial",
    observedAt: "2026-07-18T06:58:00.000Z",
    coverage: "partial",
    statement: "Tasks is connected, but one day of history is not enough for a briefing.",
  },
  {
    id: "timeline",
    label: "Timeline",
    status: "missing",
    observedAt: null,
    coverage: "unavailable",
    statement: "No Timeline snapshot exists for this new workspace yet.",
  },
  FRESH_SOURCES[2],
  FRESH_SOURCES[3],
];

function receipt(
  value: Omit<RawReceipt, "claimId" | "sourceLabel"> & {
    claimId: string;
    sourceLabel?: string;
  },
): RawReceipt {
  const source = [...FRESH_SOURCES, ...STALE_SOURCES, ...OUTAGE_SOURCES].find(
    (item) => item.id === value.sourceId,
  );
  return {
    ...value,
    sourceLabel: value.sourceLabel ?? source?.label ?? "Source",
  };
}

const NORMAL_CLAIMS: readonly RawClaim[] = [
  {
    id: "claim-capacity-blocked",
    block: "needs-attention",
    claim:
      "Final guest numbers have been blocked for four days while the venue confirms capacity.",
    whyItMatters:
      "Catering and print quantities cannot be released until the capacity decision lands.",
    nextAction: "Ask the venue for a decision before 3 pm.",
    generatedAt: GENERATED_AT,
    freshness: "current",
    coverage: "complete",
    visibility: "guest-safe",
    receipts: [
      receipt({
        id: "receipt-capacity-status",
        claimId: "claim-capacity-blocked",
        sourceId: "tasks",
        kind: "fact",
        statement: "Venue capacity sign-off has remained blocked since 14 July.",
        detail: "The task is still in progress and names the venue decision as its blocker.",
        ownerOnlyDetail: OWNER_ONLY_SENTINEL,
        rawNotesBody: RAW_NOTES_SENTINEL,
        observedAt: "2026-07-18T06:58:00.000Z",
        coverage: "complete",
        visibility: "guest-safe",
      }),
      receipt({
        id: "receipt-capacity-dependencies",
        claimId: "claim-capacity-blocked",
        sourceId: "tasks",
        kind: "fact",
        statement: "Catering quantities and place cards both depend on that sign-off.",
        observedAt: "2026-07-18T06:58:00.000Z",
        coverage: "complete",
        visibility: "workspace",
      }),
      receipt({
        id: "receipt-capacity-owner-context",
        claimId: "claim-capacity-blocked",
        sourceId: "provider",
        kind: "fact",
        statement: "A creator-only commercial detail is attached to the blocker.",
        detail: OWNER_ONLY_SENTINEL,
        observedAt: "2026-07-18T06:59:00.000Z",
        coverage: "complete",
        visibility: "owner-only",
      }),
    ],
  },
  {
    id: "claim-supplier-momentum",
    block: "moving-well",
    claim:
      "Supplier close-out is moving without intervention; five commitments finished this week.",
    whyItMatters:
      "The work is clearing at a steady pace and does not need extra attention today.",
    nextAction: "Leave the supplier plan with its current owners.",
    generatedAt: GENERATED_AT,
    freshness: "current",
    coverage: "complete",
    visibility: "guest-safe",
    receipts: [
      receipt({
        id: "receipt-supplier-streak",
        claimId: "claim-supplier-momentum",
        sourceId: "tasks",
        kind: "fact",
        statement: "Five supplier commitments moved to done between Monday and Friday.",
        observedAt: "2026-07-18T06:58:00.000Z",
        coverage: "complete",
        visibility: "guest-safe",
      }),
      receipt({
        id: "receipt-supplier-inference",
        claimId: "claim-supplier-momentum",
        sourceId: "tasks",
        kind: "inference",
        statement: "No open supplier item currently meets an attention trigger.",
        observedAt: "2026-07-18T06:58:00.000Z",
        coverage: "complete",
        visibility: "workspace",
      }),
    ],
  },
  {
    id: "claim-access-drift",
    block: "quiet-risks",
    claim:
      "Ceremony access is drifting toward next week because three small dependencies still have no owner.",
    whyItMatters:
      "Each item is minor alone, but together they reduce the remaining room before the opening milestone.",
    nextAction: "Give one person ownership of the three access dependencies.",
    generatedAt: GENERATED_AT,
    freshness: "current",
    coverage: "complete",
    visibility: "workspace",
    receipts: [
      receipt({
        id: "receipt-access-ramp",
        claimId: "claim-access-drift",
        sourceId: "tasks",
        kind: "fact",
        statement: "The temporary ramp check is open and unassigned.",
        observedAt: "2026-07-18T06:58:00.000Z",
        coverage: "complete",
        visibility: "workspace",
      }),
      receipt({
        id: "receipt-access-signage",
        claimId: "claim-access-drift",
        sourceId: "tasks",
        kind: "fact",
        statement: "Accessible signage approval is open and unassigned.",
        observedAt: "2026-07-18T06:58:00.000Z",
        coverage: "complete",
        visibility: "workspace",
      }),
      receipt({
        id: "receipt-access-confidence",
        claimId: "claim-access-drift",
        sourceId: "timeline",
        kind: "inference",
        statement: "Together, the three open dependencies leave less room before the milestone.",
        observedAt: "2026-07-18T06:54:00.000Z",
        coverage: "complete",
        visibility: "workspace",
      }),
    ],
  },
];

const DENSE_CLAIMS: readonly RawClaim[] = [
  {
    id: "claim-owner-overloaded",
    block: "needs-attention",
    claim:
      "Mara holds fourteen of the nineteen active commitments, and three handoffs are waiting on her.",
    whyItMatters:
      "A single delay now has enough reach to slow several parts of the opening at once.",
    nextAction: "Move two handoffs to another owner today.",
    generatedAt: GENERATED_AT,
    freshness: "current",
    coverage: "complete",
    visibility: "workspace",
    receipts: [
      receipt({
        id: "receipt-owner-load",
        claimId: "claim-owner-overloaded",
        sourceId: "tasks",
        kind: "fact",
        statement: "Fourteen of nineteen active commitments are assigned to Mara.",
        observedAt: "2026-07-18T06:58:00.000Z",
        coverage: "complete",
        visibility: "workspace",
      }),
      receipt({
        id: "receipt-owner-waits",
        claimId: "claim-owner-overloaded",
        sourceId: "tasks",
        kind: "fact",
        statement: "Three current handoffs name Mara as their next dependency.",
        observedAt: "2026-07-18T06:58:00.000Z",
        coverage: "complete",
        visibility: "workspace",
      }),
    ],
  },
  {
    id: "claim-permit-stall",
    block: "quiet-risks",
    claim:
      "The opening milestone is six days away, and the permit handoff has not moved in five days.",
    whyItMatters:
      "The milestone still has room, but the stalled dependency is using it up.",
    nextAction: "Confirm the permit handoff owner before midday.",
    generatedAt: GENERATED_AT,
    freshness: "current",
    coverage: "complete",
    visibility: "guest-safe",
    receipts: [
      receipt({
        id: "receipt-permit-stall",
        claimId: "claim-permit-stall",
        sourceId: "tasks",
        kind: "fact",
        statement: "The permit handoff has recorded no activity since 13 July.",
        observedAt: "2026-07-18T06:58:00.000Z",
        coverage: "complete",
        visibility: "guest-safe",
      }),
      receipt({
        id: "receipt-opening-milestone",
        claimId: "claim-permit-stall",
        sourceId: "timeline",
        kind: "fact",
        statement: "The opening milestone is dated 24 July.",
        observedAt: "2026-07-18T06:54:00.000Z",
        coverage: "complete",
        visibility: "guest-safe",
      }),
      receipt({
        id: "receipt-permit-risk",
        claimId: "claim-permit-stall",
        sourceId: "timeline",
        kind: "inference",
        statement: "The inactive handoff is consuming the remaining milestone margin.",
        observedAt: "2026-07-18T06:54:00.000Z",
        coverage: "complete",
        visibility: "workspace",
      }),
    ],
  },
  {
    id: "claim-closeout-compressed",
    block: "moving-well",
    claim:
      "Close-out work is moving steadily; the remaining activity does not need intervention today.",
    whyItMatters:
      "The high event volume reflects routine progress rather than another attention item.",
    nextAction: "Let close-out continue with its current owners.",
    generatedAt: GENERATED_AT,
    freshness: "current",
    coverage: "complete",
    visibility: "guest-safe",
    receipts: [
      receipt({
        id: "receipt-closeout-compression",
        claimId: "claim-closeout-compressed",
        sourceId: "tasks",
        kind: "inference",
        statement: "Four hundred and twenty-eight events compressed to three material claims.",
        observedAt: "2026-07-18T06:58:00.000Z",
        coverage: "complete",
        visibility: "guest-safe",
      }),
    ],
  },
];

const EDGE_CLAIMS: readonly RawClaim[] = [
  {
    id: "claim-revised-date-overdue",
    block: "needs-attention",
    claim:
      "The accessibility review is two days past its revised date after the venue changed the floor plan.",
    whyItMatters:
      "The current date, not the replaced one, is now holding the final walk-through.",
    nextAction: "Confirm whether the revised review can finish today.",
    generatedAt: GENERATED_AT,
    freshness: "current",
    coverage: "complete",
    visibility: "workspace",
    receipts: [
      receipt({
        id: "receipt-revised-date",
        claimId: "claim-revised-date-overdue",
        sourceId: "tasks",
        kind: "fact",
        statement: "The due date changed from 14 July to 16 July after the floor-plan update.",
        observedAt: "2026-07-18T06:58:00.000Z",
        coverage: "complete",
        visibility: "workspace",
      }),
      receipt({
        id: "receipt-current-overdue",
        claimId: "claim-revised-date-overdue",
        sourceId: "tasks",
        kind: "fact",
        statement: "The revised date passed two days ago and the review remains open.",
        observedAt: "2026-07-18T06:58:00.000Z",
        coverage: "complete",
        visibility: "workspace",
      }),
    ],
  },
  {
    id: "claim-client-proof-waiting",
    block: "needs-attention",
    claim: "The print proof is waiting on client approval before Monday's production slot.",
    whyItMatters:
      "Missing that slot would move printing into the week of the opening.",
    nextAction: "Ask the client for approval by 2 pm.",
    generatedAt: GENERATED_AT,
    freshness: "current",
    coverage: "complete",
    visibility: "guest-safe",
    receipts: [
      receipt({
        id: "receipt-proof-waiting",
        claimId: "claim-client-proof-waiting",
        sourceId: "tasks",
        kind: "fact",
        statement: "The proof is marked waiting on client and the production slot is Monday.",
        observedAt: "2026-07-18T06:58:00.000Z",
        coverage: "complete",
        visibility: "guest-safe",
      }),
    ],
  },
];

const STALE_CLAIMS: readonly RawClaim[] = [
  {
    ...NORMAL_CLAIMS[0],
    coverage: "partial",
    receipts: NORMAL_CLAIMS[0].receipts.filter((item) => item.sourceId === "tasks"),
  },
  {
    id: "claim-stale-plan-confidence",
    block: "quiet-risks",
    claim:
      "The opening plan last showed confidence slipping, but Timeline has not refreshed since Wednesday.",
    whyItMatters:
      "The last known change deserves a check, but the stale source cannot prove the current position.",
    nextAction: "Refresh Timeline before changing the plan.",
    generatedAt: GENERATED_AT,
    freshness: "stale",
    coverage: "partial",
    visibility: "workspace",
    receipts: [
      receipt({
        id: "receipt-stale-confidence",
        claimId: "claim-stale-plan-confidence",
        sourceId: "timeline",
        kind: "fact",
        statement: "The last Timeline snapshot lowered confidence on 15 July.",
        observedAt: "2026-07-15T16:20:00.000Z",
        coverage: "partial",
        visibility: "workspace",
      }),
      receipt({
        id: "receipt-stale-caveat",
        claimId: "claim-stale-plan-confidence",
        sourceId: "timeline",
        kind: "inference",
        statement: "No current conclusion can be drawn until Timeline refreshes.",
        observedAt: "2026-07-15T16:20:00.000Z",
        coverage: "partial",
        visibility: "workspace",
      }),
    ],
  },
];

const SCENARIOS: Readonly<Record<LabScenario, ScenarioFixture>> = {
  quiet: {
    claims: [],
    sources: FRESH_SOURCES,
    inputEventCount: 18,
    suppressedCandidateCount: 4,
  },
  normal: {
    claims: NORMAL_CLAIMS,
    sources: FRESH_SOURCES,
    inputEventCount: 64,
    suppressedCandidateCount: 7,
  },
  dense: {
    claims: DENSE_CLAIMS,
    sources: FRESH_SOURCES,
    inputEventCount: 428,
    suppressedCandidateCount: 143,
  },
  edge: {
    claims: EDGE_CLAIMS,
    sources: FRESH_SOURCES,
    inputEventCount: 24,
    // Includes the completed task whose historic blocked flag looks like a
    // trigger but must not fire.
    suppressedCandidateCount: 1,
  },
  stale: {
    claims: STALE_CLAIMS,
    sources: STALE_SOURCES,
    inputEventCount: 39,
    suppressedCandidateCount: 6,
  },
  outage: {
    claims: [],
    sources: OUTAGE_SOURCES,
    inputEventCount: 0,
    suppressedCandidateCount: 0,
  },
  "first-day": {
    claims: [],
    sources: FIRST_DAY_SOURCES,
    inputEventCount: 6,
    suppressedCandidateCount: 0,
  },
  empty: {
    claims: [],
    sources: FRESH_SOURCES,
    inputEventCount: 0,
    suppressedCandidateCount: 0,
  },
};

const HISTORY: readonly RawHistoryEdition[] = [
  {
    id: "edition-2026-07-17",
    publishedAt: "2026-07-17T07:00:00.000Z",
    scope: WORKSPACE_SCOPE,
    title: "Friday briefing",
    summary: "One venue decision needed attention; supplier work kept moving.",
    claimIds: ["history-venue-decision", "history-supplier-moving"],
    feedback: "useful",
    visibility: "guest-safe",
  },
  {
    id: "edition-2026-07-16",
    publishedAt: "2026-07-16T07:00:00.000Z",
    scope: WORKSPACE_SCOPE,
    title: "Thursday briefing",
    summary: "The permit handoff remained the only quiet risk.",
    claimIds: ["history-permit-handoff"],
    feedback: "none",
    visibility: "workspace",
  },
  {
    id: "edition-2026-07-15",
    publishedAt: "2026-07-15T07:00:00.000Z",
    scope: WORKSPACE_SCOPE,
    title: "Wednesday briefing",
    summary: "No intervention was needed after the supplier confirmations landed.",
    claimIds: ["history-supplier-confirmations"],
    feedback: "useful",
    visibility: "guest-safe",
  },
];

function includes<T extends string>(values: readonly T[], value: string): value is T {
  return (values as readonly string[]).includes(value);
}

function normalizedValue(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function normalizeOption(value: string | undefined): LabOption {
  const option = value?.trim().toUpperCase() ?? "";
  return includes(LAB_OPTIONS, option) ? option : "A";
}

function normalizeSurface(value: string | undefined): LabSurface {
  const surface = normalizedValue(value);
  if (surface === "scope" || surface === "scope-history") return "history";
  return includes(LAB_SURFACES, surface) ? surface : "briefing";
}

function normalizeScenario(value: string | undefined): LabScenario {
  const scenario = normalizedValue(value);
  const aliases: Record<string, LabScenario> = {
    "quiet-day": "quiet",
    "edge-cases": "edge",
    "partial-outage": "outage",
    first: "first-day",
  };
  const normalized = aliases[scenario] ?? scenario;
  return includes(LAB_SCENARIOS, normalized) ? normalized : "normal";
}

function normalizeRole(value: string | undefined): LabRole {
  const role = normalizedValue(value);
  return includes(LAB_ROLES, role) ? role : "creator";
}

function normalizeUiState(value: string | undefined): LabUiState {
  const state = normalizedValue(value).replaceAll("_", "-");
  return includes(LAB_UI_STATES, state) ? state : "default";
}

function normalizeViewport(value: string | undefined): LabViewport {
  const viewport = normalizedValue(value);
  if (viewport === "mobile" || viewport === "375" || viewport === "390") {
    return "phone";
  }
  if (viewport === "768" || viewport === "820") return "tablet";
  return includes(LAB_VIEWPORTS, viewport) ? viewport : "desktop";
}

function normalizeScopeKind(value: string | undefined): LabScopeKind {
  const scope = normalizedValue(value).replaceAll("_", "-");
  if (scope === "period" || scope === "planningperiod") {
    return "planning-period";
  }
  return includes(LAB_SCOPE_KINDS, scope) ? scope : "workspace";
}

/** Parse untrusted route/search-param input into the finite lab contract. */
export function normalizeSignalLabQuery(
  input: Record<string, string | undefined>,
): SignalLabQuery {
  return deepFreeze({
    option: normalizeOption(input.option),
    surface: normalizeSurface(input.surface),
    scenario: normalizeScenario(input.scenario),
    role: normalizeRole(input.role),
    uiState: normalizeUiState(input.uiState ?? input.state),
    viewport: normalizeViewport(input.viewport),
    scopeKind: normalizeScopeKind(input.scopeKind ?? input.scope),
  });
}

function canSee(role: LabRole, visibility: LabVisibility): boolean {
  if (role === "creator") return true;
  if (role === "collaborator") return visibility !== "owner-only";
  return visibility === "guest-safe";
}

function scopeFor(kind: LabScopeKind): SignalLabScope {
  return kind === "planning-period" ? PLANNING_PERIOD_SCOPE : WORKSPACE_SCOPE;
}

function serializeReceipt(receiptValue: RawReceipt, role: LabRole): SignalLabReceipt | null {
  if (!canSee(role, receiptValue.visibility)) return null;

  const detail = [
    receiptValue.detail,
    role === "creator" ? receiptValue.ownerOnlyDetail : undefined,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ");

  // This explicit allow-list is the privacy boundary. rawNotesBody and every
  // other fixture-only field are impossible to serialize accidentally.
  return {
    id: receiptValue.id,
    claimId: receiptValue.claimId,
    sourceId: receiptValue.sourceId,
    sourceLabel: receiptValue.sourceLabel,
    kind: receiptValue.kind,
    statement: receiptValue.statement,
    ...(detail ? { detail } : {}),
    observedAt: receiptValue.observedAt,
    coverage: receiptValue.coverage,
    visibility: receiptValue.visibility,
  };
}

function serializeClaim(
  rawClaim: RawClaim,
  role: LabRole,
  feedback: SignalLabClaim["feedback"],
): SignalLabClaim | null {
  if (!canSee(role, rawClaim.visibility)) return null;
  const receipts = rawClaim.receipts
    .map((item) => serializeReceipt(item, role))
    .filter((item): item is SignalLabReceipt => item !== null);

  return {
    id: rawClaim.id,
    block: rawClaim.block,
    claim: rawClaim.claim,
    whyItMatters: rawClaim.whyItMatters,
    nextAction: rawClaim.nextAction,
    generatedAt: rawClaim.generatedAt,
    freshness: rawClaim.freshness,
    coverage: rawClaim.coverage,
    visibility: rawClaim.visibility,
    receiptIds: receipts.map((item) => item.id),
    receiptCount: receipts.length,
    feedback,
  };
}

function isDegradedStatus(status: LabSourceStatus): boolean {
  return status === "stale" || status === "missing" || status === "failed" || status === "partial";
}

function modeFor(query: SignalLabQuery, sources: readonly RawSource[]): LabViewMode {
  if (query.uiState === "loading") return "loading";
  if (query.uiState === "error") return "error";
  if (query.uiState === "empty") return "empty";
  if (query.scenario === "first-day") return "first-day";
  if (query.scenario === "empty") return "empty";
  if (sources.some((source) => isDegradedStatus(source.status))) return "degraded";
  if (query.scenario === "quiet") return "quiet";
  return "ready";
}

function copyFor(mode: LabViewMode): Pick<SignalLabView, "headline" | "summary"> {
  switch (mode) {
    case "quiet":
      return {
        headline: "Nothing needs your attention today.",
        summary: "The connected work is current, and no material signal crossed the briefing threshold.",
      };
    case "degraded":
      return {
        headline: "Today's briefing is incomplete.",
        summary: "Some sources are stale or unavailable. Check the source note before acting on what remains.",
      };
    case "first-day":
      return {
        headline: "Signal needs a little history first.",
        summary: "The workspace is connected, but one day of activity is not enough to make a trustworthy claim.",
      };
    case "empty":
      return {
        headline: "There is no work to brief yet.",
        summary: "Add work in Tasks and Signal will write the first briefing when there is enough evidence.",
      };
    case "loading":
      return {
        headline: "Preparing the briefing.",
        summary: "The final state will keep the same short reading shape.",
      };
    case "error":
      return {
        headline: "The briefing could not be prepared.",
        summary: "No conclusion has been drawn. Try the fixture again.",
      };
    case "ready":
      return {
        headline: "One clear read of what deserves attention.",
        summary: "The lead signal comes first; supporting proof stays one layer down.",
      };
  }
}

function coverageFor(sources: readonly RawSource[]): string {
  const degraded = sources.filter((source) => isDegradedStatus(source.status));
  if (degraded.length === 0) {
    return "Tasks and Timeline are current. Raw Notes bodies are not read.";
  }
  return degraded.map((source) => source.statement).join(" ");
}

function historyFor(role: LabRole, scope: SignalLabScope): readonly SignalLabHistoryEdition[] {
  return HISTORY.filter((edition) => canSee(role, edition.visibility)).map((edition) => ({
    id: edition.id,
    publishedAt: edition.publishedAt,
    scope,
    title: edition.title,
    summary: edition.summary,
    claimIds: [...edition.claimIds],
    feedback: edition.feedback,
  }));
}

function claimsForMode(mode: LabViewMode): boolean {
  return mode === "ready" || mode === "degraded";
}

/**
 * Build the one shared, role-filtered truth DTO used by options A, B, and C.
 * The selected option is echoed for presentation routing but never consulted
 * while choosing claims, wording, receipts, coverage, or permissions.
 */
export function buildSignalLabView(query: SignalLabQuery): SignalLabView {
  const fixture = SCENARIOS[query.scenario];
  const scope = scopeFor(query.scopeKind);
  const mode = modeFor(query, fixture.sources);
  const feedback = query.uiState === "feedback-submitted" ? "submitted" : "none";
  const claims = claimsForMode(mode)
    ? fixture.claims
        .map((claim) => serializeClaim(claim, query.role, feedback))
        .filter((claim): claim is SignalLabClaim => claim !== null)
        .slice(0, CLAIM_CAP)
    : [];
  const leadClaim =
    claims.find((claim) => claim.block === "needs-attention") ?? claims[0] ?? null;
  const readOnly = query.role === "guest" || query.uiState === "read-only";
  const copy = copyFor(mode);

  return deepFreeze({
    datasetId: DATASET_ID,
    editionId: `edition-2026-07-18-${scope.id}-${query.scenario}`,
    query: { ...query },
    scope: { ...scope },
    generatedAt: GENERATED_AT,
    mode,
    isQuiet: mode === "quiet",
    ...copy,
    coverageStatement: coverageFor(fixture.sources),
    leadClaimId: leadClaim?.id ?? null,
    claims,
    sourceStates: fixture.sources.map((source) => ({ ...source })),
    history: historyFor(query.role, scope),
    inputEventCount: fixture.inputEventCount,
    suppressedCandidateCount: fixture.suppressedCandidateCount,
    claimCap: CLAIM_CAP,
    readOnly,
    canCreateTask: !readOnly && claims.length > 0,
  });
}

/**
 * Resolve evidence only after repeating the same claim and receipt visibility
 * checks used for the view DTO. A guessed restricted claim id returns null.
 */
export function getSignalLabEvidence(
  query: SignalLabQuery,
  claimId: string,
): SignalLabEvidence | null {
  const view = buildSignalLabView(query);
  const visibleClaim = view.claims.find((claim) => claim.id === claimId);
  if (!visibleClaim) return null;

  const rawClaim = SCENARIOS[query.scenario].claims.find((claim) => claim.id === claimId);
  if (!rawClaim || !canSee(query.role, rawClaim.visibility)) return null;

  const receipts = rawClaim.receipts
    .map((item) => serializeReceipt(item, query.role))
    .filter((item): item is SignalLabReceipt => item !== null);
  const visibleSourceIds = new Set(receipts.map((item) => item.sourceId));
  const sourceStates = view.sourceStates.filter((source) => visibleSourceIds.has(source.id));

  return deepFreeze({
    claim: visibleClaim,
    receipts,
    sourceStates,
    redactedReceiptCount: rawClaim.receipts.length - receipts.length,
    coverageStatement:
      receipts.length === 0
        ? "No evidence is available to this role."
        : view.coverageStatement,
  });
}

function normalizeTaskTitle(value: string | undefined, claim: SignalLabClaim): string {
  const fallback = claim.nextAction.replace(/[.!?]+$/, "");
  const normalized = (value ?? fallback).trim().replace(/\s+/g, " ").slice(0, 120);
  return normalized || fallback;
}

function stableHash(value: string): string {
  let left = 0x811c9dc5;
  let right = 0x9e3779b9;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    left = Math.imul(left ^ code, 0x01000193);
    right = Math.imul(right ^ code, 0x85ebca6b);
  }
  return `${(left >>> 0).toString(16).padStart(8, "0")}${(right >>> 0)
    .toString(16)
    .padStart(8, "0")}`;
}

function idempotencyKeyFor(preview: SyntheticTaskPreview): string {
  return `signal-lab-task-v1-${stableHash(
    `${DATASET_ID}\u001f${preview.scopeId}\u001f${preview.sourceClaimId}\u001f${preview.title}`,
  )}`;
}

/**
 * Prepare, but never persist, the lab's Signal-to-Task handoff.
 *
 * Confirmation is mandatory. The content fingerprint is embedded in the
 * idempotency key, so replaying the same request returns the same task id and
 * reusing the key after changing the title fails closed as a conflict.
 */
export function prepareSyntheticTask(
  query: SignalLabQuery,
  input: SyntheticTaskInput,
): SyntheticTaskResult {
  if (query.role === "guest") {
    return deepFreeze({
      status: "denied",
      reason: "guest",
      message: "Guests cannot create Tasks from a shared briefing.",
    });
  }
  if (query.uiState === "read-only") {
    return deepFreeze({
      status: "denied",
      reason: "read-only",
      message: "This lab view is read-only.",
    });
  }

  const view = buildSignalLabView(query);
  const claim = view.claims.find((item) => item.id === input.claimId);
  if (!claim) {
    return deepFreeze({
      status: "denied",
      reason: "claim-unavailable",
      message: "That claim is not available in this role and scope.",
    });
  }

  const preview: SyntheticTaskPreview = {
    title: normalizeTaskTitle(input.title, claim),
    scopeId: view.scope.id,
    sourceClaimId: claim.id,
    nextAction: claim.nextAction,
  };
  const expectedIdempotencyKey = idempotencyKeyFor(preview);

  if (!input.confirmed) {
    return deepFreeze({
      status: "needs-confirmation",
      idempotencyKey: expectedIdempotencyKey,
      preview,
    });
  }

  const suppliedKey = input.idempotencyKey?.trim();
  if (suppliedKey && suppliedKey !== expectedIdempotencyKey) {
    return deepFreeze({
      status: "conflict",
      idempotencyKey: suppliedKey,
      expectedIdempotencyKey,
      message: "The task content changed after this idempotency key was issued.",
    });
  }

  return deepFreeze({
    status: "prepared",
    idempotencyKey: expectedIdempotencyKey,
    taskId: `task-lab-${stableHash(expectedIdempotencyKey)}`,
    preparedAt: GENERATED_AT,
    preview,
  });
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}
