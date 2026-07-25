import { NextResponse } from "next/server";
import { signalDesignLabAvailable } from "@/server/design-lab/access";
import { getSignalLabEvidence, normalizeSignalLabQuery } from "@/lib/design-lab/signal";

export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ claimId: string }> }) {
  if (!signalDesignLabAvailable()) return new NextResponse(null, { status: 404 });
  const url = new URL(request.url); const query = normalizeSignalLabQuery(Object.fromEntries(url.searchParams.entries()));
  const evidence = getSignalLabEvidence(query, (await params).claimId);
  if (!evidence) return new NextResponse(null, { status: 404 });
  return NextResponse.json(evidence, { headers: { "cache-control": "no-store, private" } });
}
