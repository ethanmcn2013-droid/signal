import type { Metadata } from "next";
import Link from "next/link";
import { unsubscribeByToken } from "@/lib/preferences";

export const metadata: Metadata = {
  title: "You're off — Signal Analytics",
  description: "You've been removed from briefing emails.",
};

// No-auth landing for unsubscribe links inside emails.
// The token resolves the user; we set cadence to "off" and rotate the token
// so the link can't be replayed by a forwarder.
export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await unsubscribeByToken(token);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[520px] flex-col items-center justify-center px-6 py-16 text-center">
      {result.ok ? (
        <>
          <p
            className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--ink-quiet)" }}
          >
            You're off.
          </p>
          <h1
            className="mb-4 text-[32px] font-semibold leading-[1.15]"
            style={{ color: "var(--ink)" }}
          >
            No more briefing emails to{" "}
            <span style={{ color: "var(--ink-soft)" }}>{result.email}</span>.
          </h1>
          <p
            className="mb-8 text-[15px] leading-[1.6]"
            style={{ color: "var(--ink-soft)" }}
          >
            That's it. Nothing else lands in your inbox from us. You can
            still open the briefing in the app whenever you want, and you
            can turn emails back on any time from settings.
          </p>
          <Link
            href="/app/settings/notifications"
            className="rounded-md px-4 py-2 text-[14px] font-medium underline underline-offset-4"
            style={{ color: "var(--ink)" }}
          >
            Change your mind →
          </Link>
        </>
      ) : (
        <>
          <h1
            className="mb-4 text-[28px] font-semibold leading-[1.15]"
            style={{ color: "var(--ink)" }}
          >
            This link doesn't match an account.
          </h1>
          <p
            className="mb-8 text-[15px] leading-[1.6]"
            style={{ color: "var(--ink-soft)" }}
          >
            Either you've already used it, or it was meant for someone else.
            You can manage your briefing emails from settings.
          </p>
          <Link
            href="/app/settings/notifications"
            className="text-[14px] underline underline-offset-4"
            style={{ color: "var(--ink)" }}
          >
            Open settings →
          </Link>
        </>
      )}
    </main>
  );
}
