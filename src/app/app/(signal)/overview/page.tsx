import { notFound } from "next/navigation";
import { OverviewView } from "@/components/signal/overview-view";
import { SignalAppShell } from "@/components/signal/signal-app-shell";
import { isSignalAnalyticsEnabled } from "@/server/analytics/feature-flag";
import { calculateSignalView } from "@/server/analytics/service";
import {
  buildSignalPageChrome,
  canonicalSignalParams,
  evidenceHref,
  evidenceState,
  preferencesEndpoint,
  requireAnalyticsPageContext,
  type SignalSearchParams,
} from "../page-data";

interface OverviewPageProps {
  searchParams: Promise<SignalSearchParams>;
}

export default async function OverviewPage({ searchParams }: OverviewPageProps) {
  if (!isSignalAnalyticsEnabled()) notFound();

  const input = await searchParams;
  const context = await requireAnalyticsPageContext(input);
  const params = canonicalSignalParams(context, input, "overview");
  const result = await calculateSignalView(
    context.authorization,
    "overview",
    context.state.evidenceId,
    context.state.evidencePage,
  );
  const chrome = buildSignalPageChrome(context, result.navigation);
  const makeEvidenceHref = (id: string) =>
    evidenceHref("/app/overview", params, id);

  return (
    <SignalAppShell
      view="overview"
      heading="What is true right now"
      subheading="A grounded view across Notes, Tasks, and Timeline for this scope."
      scopeLabel={chrome.scopeLabel}
      meta={{ ...result.view.meta, scope: context.state.query.scope }}
      scopes={chrome.scopes}
      ownerOptions={chrome.ownerOptions}
      statusOptions={chrome.statusOptions}
      evidence={evidenceState(
        "/app/overview",
        params,
        result.evidence,
        chrome.ownerNames,
        chrome.projectNames,
        context.state.query.scope,
      )}
    >
      <OverviewView
        overview={result.view}
        evidenceHref={makeEvidenceHref}
        preferences={context.preferences}
        preferencesEndpoint={preferencesEndpoint(params)}
        scopeLabel={chrome.scopeLabel}
        ownerNames={chrome.ownerNames}
      />
    </SignalAppShell>
  );
}
