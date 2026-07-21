import { calculateBriefing } from "@/server/analytics/service";
import { runAnalyticsRoute } from "@/server/analytics/route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  return runAnalyticsRoute(request, calculateBriefing);
}
