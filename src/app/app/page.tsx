import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getAnalyticsUser } from "@/server/onboarding/queries";
import { buildBriefingForUser } from "@/server/briefing/build-for-user";
import { BriefingView } from "@/components/brief/briefing-view";
import { isDemoMode } from "@/lib/access-mode";
import { SignalScopeSwitcher } from "@/components/brief/scope-switcher";
import { planningPeriodsEnabled, type SignalScope } from "@/lib/planning-periods/scope";
import { recordPlanningEvent } from "@/server/planning-events";

/**
 * /app, the authenticated landing surface.
 *
 * Flow:
 *   - auth gate (also enforced at proxy + layout, defense in depth)
 *   - if no linked workspace, kick to /app/onboarding
 *   - otherwise build a daily briefing for the user (engine-driven,
 *     prose-rendered, rotation-persisted) and render it
 */
export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const demo = isDemoMode();

  // Production path: real auth + workspace gate. Demo/Review skips both —
  // the briefing is built from the in-memory mock signals (no DB).
  const { userId } = demo ? { userId: null } : await auth();
  if (!demo) {
    if (!userId) redirect("/sign-in");

    const user = await getAnalyticsUser(userId);
    if (!user?.linkedWorkspaceId) {
      redirect("/app/onboarding");
    }
  }

  const params = await searchParams;
  const hintedScope: SignalScope | undefined =
    planningPeriodsEnabled() && typeof params.workspaceId === "string"
      ? { kind: "workspace", workspaceId: params.workspaceId }
      : planningPeriodsEnabled() && typeof params.planningPeriodId === "string"
        ? { kind: "planningPeriod", planningPeriodId: params.planningPeriodId }
        : undefined;
  const [result, me] = await Promise.all([
    buildBriefingForUser({
      clerkId: userId ?? "demo-user",
      cadence: "daily",
      scope: hintedScope,
    }),
    demo ? Promise.resolve(null) : currentUser(),
  ]);

  // `no-workspace` is unreachable here, we just redirected on the
  // same condition. Defensively narrow anyway.
  if (result.kind === "no-workspace") {
    redirect("/app/onboarding");
  }

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
