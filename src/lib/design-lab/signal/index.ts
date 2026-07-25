/** Server entry point for the isolated Signal design-lab truth model. */
export {
  buildSignalLabView,
  getSignalLabEvidence,
  normalizeSignalLabQuery,
  prepareSyntheticTask,
} from "./authority";

export type {
  LabClaimBlock,
  LabCoverage,
  LabOption,
  LabReceiptKind,
  LabRole,
  LabScenario,
  LabScopeKind,
  LabSourceStatus,
  LabSurface,
  LabUiState,
  LabViewport,
  LabViewMode,
  LabVisibility,
  SignalLabClaim,
  SignalLabEvidence,
  SignalLabHistoryEdition,
  SignalLabQuery,
  SignalLabReceipt,
  SignalLabScope,
  SignalLabSourceState,
  SignalLabView,
  SyntheticTaskInput,
  SyntheticTaskPreview,
  SyntheticTaskResult,
} from "./types";
