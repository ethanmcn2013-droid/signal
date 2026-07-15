import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BriefingView } from "@/components/brief/briefing-view";
import { SignalScopeSwitcher } from "@/components/brief/scope-switcher";
import { isDemoMode } from "@/lib/access-mode";
import {
  planningPeriodsEnabled,
  type SignalScope,
} from "@/lib/planning-periods/scope";
import { buildBriefingForUser } from "@/server/briefing/build-for-user";
import { getAnalyticsUser } from "@/server/onboarding/queries";
import { recordPlanningEvent } from "@/server/planning-events";

/** Production-off fallback while progressive analytics remains staged. */
export async function LegacyBriefing({
  searchParams = {},
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const demo = isDemoMode();
  const { userId } = demo ? { userId: null } : await auth();

  if (!demo) {
    if (!userId) redirect("/sign-in");
    const user = await getAnalyticsUser(userId);
    if (!user?.linkedWorkspaceId) redirect("/app/onboarding");
  }

  const hintedScope: SignalScope | undefined =
    planningPeriodsEnabled() && typeof searchParams.workspaceId === "string"
      ? { kind: "workspace", workspaceId: searchParams.workspaceId }
      : planningPeriodsEnabled() &&
          typeof searchParams.planningPeriodId === "string"
        ? {
            kind: "planningPeriod",
            planningPeriodId: searchParams.planningPeriodId,
          }
        : undefined;

  const [result, me] = await Promise.all([
    buildBriefingForUser({
      clerkId: userId ?? "demo-user",
      cadence: "daily",
      scope: hintedScope,
    }),
    demo ? Promise.resolve(null) : currentUser(),
  ]);
  if (result.kind === "no-workspace") redirect("/app/onboarding");

  if (result.authorizedScope.scope.kind === "planningPeriod") {
    await recordPlanningEvent({
      eventName: "period_signal_viewed",
      scopeKind: "planningPeriod",
      workspaceCount: result.authorizedScope.workspaces.length,
    });
  }

  return (
    <>
      {planningPeriodsEnabled() ? (
        <SignalScopeSwitcher
          catalog={result.catalog}
          activeScope={result.authorizedScope.scope}
          demo={demo}
        />
      ) : null}
      <BriefingView
        briefing={result.briefing}
        firstName={me?.firstName ?? null}
        scopeLabel={result.authorizedScope.label}
        scopeKind={result.authorizedScope.scope.kind}
      />
    </>
  );
}
