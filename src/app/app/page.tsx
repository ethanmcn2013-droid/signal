import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getAnalyticsUser } from "@/server/onboarding/queries";
import { buildBriefingForUser } from "@/server/briefing/build-for-user";
import { BriefingView } from "@/components/brief/briefing-view";

/**
 * /app — the authenticated landing surface.
 *
 * Flow:
 *   - auth gate (also enforced at proxy + layout — defense in depth)
 *   - if no linked workspace, kick to /app/onboarding
 *   - otherwise build a daily briefing for the user (engine-driven,
 *     prose-rendered, rotation-persisted) and render it
 */
export default async function AppPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getAnalyticsUser(userId);
  if (!user?.linkedWorkspaceId) {
    redirect("/app/onboarding");
  }

  const [result, me] = await Promise.all([
    buildBriefingForUser({
      clerkId: userId,
      cadence: "daily",
    }),
    currentUser(),
  ]);

  // `no-workspace` is unreachable here — we just redirected on the
  // same condition. Defensively narrow anyway.
  if (result.kind === "no-workspace") {
    redirect("/app/onboarding");
  }

  return <BriefingView briefing={result.briefing} firstName={me?.firstName ?? null} />;
}
