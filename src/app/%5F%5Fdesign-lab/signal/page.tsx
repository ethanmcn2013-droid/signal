import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { signalDesignLabAvailable } from "@/server/design-lab/access";
import { buildSignalLabView, normalizeSignalLabQuery } from "@/lib/design-lab/signal";
import SignalDesignLab from "./signal-lab";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Signal design lab", robots: { index: false, follow: false } };

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function SignalDesignLabPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  if (!signalDesignLabAvailable()) notFound();
  const params = await searchParams;
  const query = normalizeSignalLabQuery(Object.fromEntries(Object.entries(params).map(([key, value]) => [key, first(value)])));
  return <SignalDesignLab initialView={buildSignalLabView(query)} />;
}
