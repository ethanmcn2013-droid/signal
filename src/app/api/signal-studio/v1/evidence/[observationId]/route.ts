import { calculateEvidence } from "@/server/analytics/service";
import { runAnalyticsRoute } from "@/server/analytics/route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ observationId: string }> },
) {
  const { observationId } = await context.params;
  return runAnalyticsRoute(request, (authorized) =>
    calculateEvidence(authorized, observationId),
  );
}
