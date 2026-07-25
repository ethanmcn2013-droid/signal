import { NextResponse } from "next/server";
import { signalDesignLabAvailable } from "@/server/design-lab/access";
import { normalizeSignalLabQuery, prepareSyntheticTask } from "@/lib/design-lab/signal";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!signalDesignLabAvailable()) return new NextResponse(null, { status: 404 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const query = normalizeSignalLabQuery(Object.fromEntries(Object.entries(body).filter(([, value]) => typeof value === "string") as [string, string][]));
  const result = prepareSyntheticTask(query, { claimId: String(body.claimId ?? ""), confirmed: body.confirmed === true, idempotencyKey: typeof body.idempotencyKey === "string" ? body.idempotencyKey : undefined, title: typeof body.title === "string" ? body.title : undefined });
  return NextResponse.json(result, { headers: { "cache-control": "no-store, private" } });
}
