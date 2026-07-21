import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Daily Signal, Signal",
  description: "One short read on what genuinely needs attention now.",
};

type LegacyBriefSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

/** Keep old briefing links alive while converging on `/app`. */
export default async function LegacyBriefPage({
  searchParams,
}: {
  searchParams: LegacyBriefSearchParams;
}) {
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (value !== undefined) params.set(key, value);
  }
  const query = params.toString();
  redirect(query ? `/app?${query}` : "/app");
}
