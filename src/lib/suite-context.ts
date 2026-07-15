export type SuiteProductId = "studio" | "tasks" | "timeline" | "signal" | "notes";

export type SuiteNavigationContext = Readonly<{
  sourceProduct: SuiteProductId;
  workspaceId?: string;
  projectId?: string;
  planningPeriodId?: string;
  returnUrl?: string;
}>;

const MAX_IDENTIFIER_LENGTH = 200;
const MAX_RETURN_URL_LENGTH = 2_048;
const NESTED_TRANSPORT_PARAMETERS = ["sourceProduct", "returnUrl"] as const;
const PRODUCT_IDS = new Set<SuiteProductId>([
  "studio",
  "tasks",
  "timeline",
  "signal",
  "notes",
]);

function boundedIdentifier(value: string | null): string | undefined {
  if (value && /[\u0000-\u001f\u007f]/.test(value)) return undefined;
  const normalized = value?.trim();
  if (
    !normalized ||
    normalized.length > MAX_IDENTIFIER_LENGTH
  ) {
    return undefined;
  }
  return normalized;
}

function isAllowedReturnUrl(url: URL): boolean {
  const isSuiteHost =
    url.hostname === "signalstudio.ie" ||
    url.hostname.endsWith(".signalstudio.ie");
  const isLocalReviewHost =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]";
  return (
    (url.protocol === "https:" && isSuiteHost) ||
    ((url.protocol === "http:" || url.protocol === "https:") && isLocalReviewHost)
  );
}

function currentPageReturnUrl(location: URL): string | undefined {
  if (!isAllowedReturnUrl(location)) return undefined;

  const returnUrl = new URL(location);
  for (const parameter of NESTED_TRANSPORT_PARAMETERS) {
    returnUrl.searchParams.delete(parameter);
  }

  const serialized = returnUrl.toString();
  return serialized.length <= MAX_RETURN_URL_LENGTH ? serialized : undefined;
}

/**
 * Read the canonical suite context from a product URL without trusting inbound
 * source or return values. Signal's native snake_case scope is accepted so the
 * shared product switcher can carry the currently selected workspace/project.
 */
export function readSuiteNavigationContext(
  location: URL,
  sourceProduct: SuiteProductId,
): SuiteNavigationContext {
  const workspaceId = boundedIdentifier(
    location.searchParams.get("workspace_id") ??
      location.searchParams.get("workspaceId"),
  );

  const nativeProjectId =
    location.searchParams.get("scope_type") === "project"
      ? location.searchParams.get("scope_id")
      : null;
  const projectId = boundedIdentifier(
    nativeProjectId ??
      location.searchParams.get("project_id") ??
      location.searchParams.get("projectId"),
  );
  const planningPeriodId = boundedIdentifier(
    location.searchParams.get("planningPeriodId"),
  );
  const returnUrl = currentPageReturnUrl(location);

  return {
    sourceProduct,
    ...(workspaceId ? { workspaceId } : {}),
    ...(projectId ? { projectId } : {}),
    ...(planningPeriodId ? { planningPeriodId } : {}),
    ...(returnUrl ? { returnUrl } : {}),
  };
}

/**
 * Translate an inbound version-one SuiteContext into Signal's native scope
 * keys. Native keys win when both forms are present; authorization remains a
 * server responsibility after parsing.
 */
export function normalizeSuiteContextForSignal(
  input: URLSearchParams,
): URLSearchParams {
  const normalized = new URLSearchParams(input);
  const sourceProduct = input.get("sourceProduct") as SuiteProductId | null;
  if (!sourceProduct || !PRODUCT_IDS.has(sourceProduct)) return normalized;

  const workspaceId = boundedIdentifier(input.get("workspaceId"));
  if (!normalized.has("workspace_id") && workspaceId) {
    normalized.set("workspace_id", workspaceId);
  }

  const projectId = boundedIdentifier(input.get("projectId"));
  if (projectId && !normalized.has("scope_id")) {
    normalized.set("scope_id", projectId);
    if (!normalized.has("scope_type")) normalized.set("scope_type", "project");
  }

  return normalized;
}

/** Build a destination /app URL using the version-one SuiteContext keys. */
export function buildSuiteProductHref(
  appUrl: string,
  context: SuiteNavigationContext,
): string {
  const destination = new URL(appUrl);
  destination.searchParams.set("sourceProduct", context.sourceProduct);
  if (context.workspaceId) {
    destination.searchParams.set("workspaceId", context.workspaceId);
  }
  if (context.projectId) {
    destination.searchParams.set("projectId", context.projectId);
  }
  if (context.workspaceId || context.planningPeriodId) {
    destination.searchParams.set("contextVersion", "2");
  }
  if (context.planningPeriodId) {
    destination.searchParams.set("planningPeriodId", context.planningPeriodId);
  }
  if (context.returnUrl) {
    const returnUrl = new URL(context.returnUrl);
    if (
      isAllowedReturnUrl(returnUrl) &&
      context.returnUrl.length <= MAX_RETURN_URL_LENGTH
    ) {
      destination.searchParams.set("returnUrl", context.returnUrl);
    }
  }
  return destination.toString();
}
