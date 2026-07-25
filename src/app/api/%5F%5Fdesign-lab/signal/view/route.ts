import { NextResponse } from "next/server";
import { signalDesignLabAvailable } from "@/server/design-lab/access";
import { buildSignalLabView, normalizeSignalLabQuery } from "@/lib/design-lab/signal";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!signalDesignLabAvailable()) return new NextResponse(null, { status: 404 });
  const url = new URL(request.url);
  const query = normalizeSignalLabQuery(Object.fromEntries(url.searchParams.entries()));
  return NextResponse.json(buildSignalLabView(query), { headers: { "cache-control": "no-store, private" } });
}
