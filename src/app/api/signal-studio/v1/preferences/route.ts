import { NextResponse } from "next/server";
import {
  AnalyticsApiError,
  analyticsErrorResponse,
  PRIVATE_RESPONSE_HEADERS,
} from "@/server/analytics/errors";
import { assertTrustedMutationOrigin } from "@/server/analytics/origin";
import { authorizeAnalyticsRequest } from "@/server/analytics/policy";
import {
  readAnalyticsPreferences,
  writeAnalyticsPreferences,
} from "@/server/analytics/preferences";
import { parseAnalyticsQuery } from "@/server/analytics/query";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  return run(request, false);
}

export async function PATCH(request: Request) {
  return run(request, true);
}

async function run(request: Request, mutation: boolean): Promise<NextResponse> {
  const started = performance.now();
  try {
    if (mutation) assertTrustedMutationOrigin(request);
    const query = parseAnalyticsQuery(request);
    const context = await authorizeAnalyticsRequest(query);
    if (context.principal.dataAccess !== "live") {
      return NextResponse.json(
        { hiddenCardIds: [], pinnedCardIds: [], cardOrder: [], updatedAt: null },
        { headers: PRIVATE_RESPONSE_HEADERS },
      );
    }
    let data;
    if (mutation) {
      const length = Number(request.headers.get("content-length") ?? "0");
      if (Number.isFinite(length) && length > 16_384) {
        throw new AnalyticsApiError(413, "invalid_request", "Preference payload is too large.");
      }
      let payload: unknown;
      try {
        payload = await request.json();
      } catch {
        return NextResponse.json(
          { error: { code: "invalid_request", message: "Preference payload must be valid JSON." } },
          { status: 400, headers: PRIVATE_RESPONSE_HEADERS },
        );
      }
      data = await writeAnalyticsPreferences(
        context.principal.clerkId,
        context.query.scope.workspaceId,
        payload,
      );
    } else {
      data = await readAnalyticsPreferences(
        context.principal.clerkId,
        context.query.scope.workspaceId,
      );
    }
    return NextResponse.json(data, {
      headers: {
        ...PRIVATE_RESPONSE_HEADERS,
        "Server-Timing": `preferences;dur=${(performance.now() - started).toFixed(1)}`,
        "X-Signal-Query-Count": "1",
      },
    });
  } catch (error) {
    return analyticsErrorResponse(error);
  }
}
