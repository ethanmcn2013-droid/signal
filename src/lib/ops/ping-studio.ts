import "server-only";

interface PingPayload {
  source: "analytics_daily";
  ranAt: number;
  ok: boolean;
  considered?: number;
  sent?: number;
  skipped?: number;
  failed?: number;
  isMondayUtc?: boolean;
  notes?: string;
}

const TIMEOUT_MS = 2000;

// The bearer secret is only ever sent to the Studio HQ host. If the
// env var is misconfigured / DNS-hijacked to anywhere else, refuse
// to send rather than leak the credential.
function isAllowedHost(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    return (
      u.hostname === "signalstudio.ie" ||
      u.hostname.endsWith(".signalstudio.ie")
    );
  } catch {
    return false;
  }
}

export async function pingStudio(payload: PingPayload): Promise<void> {
  const url = process.env.STUDIO_CRON_PING_URL;
  const secret = process.env.STUDIO_CRON_PING_SECRET;
  if (!url || !secret) {
    return;
  }
  if (!isAllowedHost(url)) {
    console.error(
      "[ping-studio] STUDIO_CRON_PING_URL is not a signalstudio.ie https host, refusing to send (credential safety).",
    );
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch {
    // Never throw, observability must not break dispatch.
  } finally {
    clearTimeout(timer);
  }
}
