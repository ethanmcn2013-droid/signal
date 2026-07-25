import { getAccessMode } from "@/lib/access-mode";

/**
 * The Signal design lab is intentionally absent from ordinary demo and
 * production modes. Local development is available by default. A deployed
 * review also requires an explicit, server-only enable flag.
 */
export function signalDesignLabAvailable(): boolean {
  const mode = getAccessMode();
  if (mode === "development") return true;
  return (
    mode === "review" &&
    process.env.SIGNAL_DESIGN_LAB_ENABLED === "true" &&
    process.env.VERCEL_ENV !== "production"
  );
}

