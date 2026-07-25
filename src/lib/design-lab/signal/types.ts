/**
 * Client-importable contracts for the isolated Signal design lab.
 *
 * This file intentionally contains no fixtures, authorization rules, or
 * server-only marker. Client components may use these DTO types and control
 * values; they must call a server authority for the data itself.
 */

export const LAB_OPTIONS = ["A", "B", "C"] as const;
export type LabOption = (typeof LAB_OPTIONS)[number];

export const LAB_SURFACES = [
  "briefing",
  "today",
  "evidence",
  "history",
] as const;
export type LabSurface = (typeof LAB_SURFACES)[number];

export const LAB_SCENARIOS = [
  "quiet",
  "normal",
  "dense",
  "edge",
  "stale",
  "outage",
  "first-day",
  "empty",
] as const;
export type LabScenario = (typeof LAB_SCENARIOS)[number];

export const LAB_ROLES = ["creator", "collaborator", "guest"] as const;
export type LabRole = (typeof LAB_ROLES)[number];

export const LAB_UI_STATES = [
  "default",
  "loading",
  "empty",
  "error",
  "read-only",
  "feedback-submitted",
] as const;
export type LabUiState = (typeof LAB_UI_STATES)[number];

export const LAB_VIEWPORTS = ["phone", "tablet", "desktop"] as const;
export type LabViewport = (typeof LAB_VIEWPORTS)[number];

export const LAB_SCOPE_KINDS = ["workspace", "planning-period"] as const;
export type LabScopeKind = (typeof LAB_SCOPE_KINDS)[number];

export const LAB_SOURCE_STATUSES = [
  "fresh",
  "stale",
  "missing",
  "failed",
  "partial",
  "unsupported",
] as const;
export type LabSourceStatus = (typeof LAB_SOURCE_STATUSES)[number];

export type LabVisibility = "guest-safe" | "workspace" | "owner-only";
export type LabReceiptKind = "fact" | "inference";
export type LabCoverage =
  | "complete"
  | "partial"
  | "unavailable"
  | "not-used";
export type LabClaimBlock =
  | "needs-attention"
  | "moving-well"
  | "quiet-risks";
export type LabViewMode =
  | "ready"
  | "quiet"
  | "degraded"
  | "first-day"
  | "empty"
  | "loading"
  | "error";

export type SignalLabQuery = Readonly<{
  option: LabOption;
  surface: LabSurface;
  scenario: LabScenario;
  role: LabRole;
  uiState: LabUiState;
  viewport: LabViewport;
  scopeKind: LabScopeKind;
}>;

export type SignalLabScope = Readonly<{
  kind: LabScopeKind;
  id: string;
  label: string;
}>;

export type SignalLabSourceState = Readonly<{
  id: "tasks" | "timeline" | "notes" | "provider";
  label: string;
  status: LabSourceStatus;
  observedAt: string | null;
  coverage: LabCoverage;
  statement: string;
}>;

export type SignalLabClaim = Readonly<{
  id: string;
  block: LabClaimBlock;
  claim: string;
  whyItMatters: string;
  nextAction: string;
  generatedAt: string;
  freshness: "current" | "stale" | "incomplete";
  coverage: LabCoverage;
  visibility: LabVisibility;
  receiptIds: readonly string[];
  receiptCount: number;
  feedback: "none" | "submitted";
}>;

export type SignalLabReceipt = Readonly<{
  id: string;
  claimId: string;
  sourceId: SignalLabSourceState["id"];
  sourceLabel: string;
  kind: LabReceiptKind;
  statement: string;
  detail?: string;
  observedAt: string | null;
  coverage: LabCoverage;
  visibility: LabVisibility;
}>;

export type SignalLabHistoryEdition = Readonly<{
  id: string;
  publishedAt: string;
  scope: SignalLabScope;
  title: string;
  summary: string;
  claimIds: readonly string[];
  feedback: "none" | "useful" | "not-useful";
}>;

export type SignalLabView = Readonly<{
  datasetId: "signal-lab-2026-07-18-v1";
  editionId: string;
  query: SignalLabQuery;
  scope: SignalLabScope;
  generatedAt: string;
  mode: LabViewMode;
  isQuiet: boolean;
  headline: string;
  summary: string;
  coverageStatement: string;
  leadClaimId: string | null;
  claims: readonly SignalLabClaim[];
  sourceStates: readonly SignalLabSourceState[];
  history: readonly SignalLabHistoryEdition[];
  inputEventCount: number;
  suppressedCandidateCount: number;
  claimCap: 3;
  readOnly: boolean;
  canCreateTask: boolean;
}>;

export type SignalLabEvidence = Readonly<{
  claim: SignalLabClaim;
  receipts: readonly SignalLabReceipt[];
  sourceStates: readonly SignalLabSourceState[];
  redactedReceiptCount: number;
  coverageStatement: string;
}>;

export type SyntheticTaskInput = Readonly<{
  claimId: string;
  confirmed: boolean;
  idempotencyKey?: string;
  title?: string;
}>;

export type SyntheticTaskPreview = Readonly<{
  title: string;
  scopeId: string;
  sourceClaimId: string;
  nextAction: string;
}>;

export type SyntheticTaskResult =
  | Readonly<{
      status: "denied";
      reason: "guest" | "read-only" | "claim-unavailable";
      message: string;
    }>
  | Readonly<{
      status: "needs-confirmation";
      idempotencyKey: string;
      preview: SyntheticTaskPreview;
    }>
  | Readonly<{
      status: "conflict";
      idempotencyKey: string;
      expectedIdempotencyKey: string;
      message: string;
    }>
  | Readonly<{
      status: "prepared";
      idempotencyKey: string;
      taskId: string;
      preparedAt: string;
      preview: SyntheticTaskPreview;
    }>;
