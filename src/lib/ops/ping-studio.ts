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

export async function pingStudio(payload: PingPayload): Promise<void> {
  const url = process.env.STUDIO_CRON_PING_URL;
  const secret = process.env.STUDIO_CRON_PING_SECRET;
  if (!url || !secret) {
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
    // Never throw — observability must not break dispatch.
  } finally {
    clearTimeout(timer);
  }
}
