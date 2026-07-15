import { notFound } from "next/navigation";
import type { BreakdownKey, MetricKey } from "@/lib/analytics/contracts";
import { SignalAppShell } from "@/components/signal/signal-app-shell";
import { signalHref } from "@/components/signal/links";
import { TrendsView } from "@/components/signal/trends-view";
import { isSignalAnalyticsEnabled } from "@/server/analytics/feature-flag";
import { calculateSignalView } from "@/server/analytics/service";
import {
  buildSignalPageChrome,
  canonicalSignalParams,
  evidenceHref,
  evidenceState,
  requireAnalyticsPageContext,
  type SignalSearchParams,
} from "../page-data";

interface TrendsPageProps {
  searchParams: Promise<SignalSearchParams>;
}

export default async function TrendsPage({ searchParams }: TrendsPageProps) {
  if (!isSignalAnalyticsEnabled()) notFound();

  const input = await searchParams;
  const context = await requireAnalyticsPageContext(input);
  const params = canonicalSignalParams(context, input, "trends");
  const result = await calculateSignalView(
    context.authorization,
    "trends",
    context.state.evidenceId,
    context.state.evidencePage,
  );
  const chrome = buildSignalPageChrome(context, result.navigation);
  const makeEvidenceHref = (id: string) =>
    evidenceHref("/app/trends", params, id);

  return (
    <SignalAppShell
      view="trends"
      heading="What is changing over time"
      subheading="One focused metric, its comparison, and the work underneath it."
      scopeLabel={chrome.scopeLabel}
      meta={{ ...result.view.meta, scope: context.state.query.scope }}
      scopes={chrome.scopes}
      ownerOptions={chrome.ownerOptions}
      statusOptions={chrome.statusOptions}
      evidence={evidenceState(
        "/app/trends",
        params,
        result.evidence,
        chrome.ownerNames,
        chrome.projectNames,
        context.state.query.scope,
      )}
    >
      <TrendsView
        trends={result.view}
        metricHref={(metric: MetricKey) =>
          signalHref("/app/trends", params, {
            metric,
            evidence: null,
            evidence_page: null,
            page: null,
          })
        }
        breakdownHref={(breakdown: BreakdownKey) =>
          signalHref("/app/trends", params, {
            breakdown,
            evidence: null,
            evidence_page: null,
            page: null,
          })
        }
        evidenceHref={makeEvidenceHref}
        pageHref={(page: number) =>
          signalHref("/app/trends", params, {
            page: String(page),
            evidence: null,
            evidence_page: null,
          })
        }
        ownerNames={chrome.ownerNames}
        projectNames={chrome.projectNames}
      />
    </SignalAppShell>
  );
}
