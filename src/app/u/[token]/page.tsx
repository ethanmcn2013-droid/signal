import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { lookupByToken, unsubscribeByToken } from "@/lib/preferences";

export const metadata: Metadata = {
  title: "Unsubscribe — Signal Analytics",
  description: "Confirm you want to stop briefing emails.",
};

// No-auth landing for unsubscribe links inside emails. GET is read-only
// (no side effects) so image preloaders, Slack link unfurls, link-checkers,
// and AV scanners can't silently unsubscribe users just by following the URL.
// The actual mutation happens on POST via a server action below.
//
// Apple Mail / Gmail's native one-click unsubscribe button hits
// `/api/unsubscribe/[token]` directly per RFC 8058 — that endpoint stays
// auto-confirming because the mail client doesn't render this page.
export default async function UnsubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const { token } = await params;
  const { confirmed } = await searchParams;

  // After a successful POST we redirect here with ?confirmed=1; show the
  // post-unsubscribe state without re-mutating.
  if (confirmed === "1") {
    return <DoneState />;
  }

  const lookup = await lookupByToken(token);

  if (!lookup.ok) {
    return <NotFoundState />;
  }

  async function confirm(formData: FormData) {
    "use server";
    const t = String(formData.get("token") ?? "");
    if (!t) return;
    const result = await unsubscribeByToken(t);
    if (result.ok) {
      redirect(`/u/${encodeURIComponent(t)}?confirmed=1`);
    } else {
      redirect(`/u/${encodeURIComponent(t)}`);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[520px] flex-col items-center justify-center px-6 py-16 text-center">
      <p
        className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: "var(--ink-quiet)" }}
      >
        One tap to confirm.
      </p>
      <h1
        className="mb-4 text-[28px] font-semibold leading-[1.15]"
        style={{ color: "var(--ink)" }}
      >
        Stop sending briefings to{" "}
        <span style={{ color: "var(--ink-soft)" }}>{lookup.email}</span>?
      </h1>
      <p
        className="mb-8 text-[15px] leading-[1.6]"
        style={{ color: "var(--ink-soft)" }}
      >
        Nothing changes until you confirm. You can turn emails back on any
        time from settings.
      </p>
      <form action={confirm}>
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className="rounded-md border border-line bg-ink px-4 py-2 text-[14px] font-medium text-bg-elevated transition-opacity hover:opacity-90"
        >
          Yes, unsubscribe
        </button>
      </form>
      <Link
        href="/app/settings/notifications"
        className="mt-6 text-[13px] underline underline-offset-4"
        style={{ color: "var(--ink-quiet)" }}
      >
        Open settings instead
      </Link>
    </main>
  );
}

function DoneState() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[520px] flex-col items-center justify-center px-6 py-16 text-center">
      <p
        className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: "var(--ink-quiet)" }}
      >
        You&apos;re off.
      </p>
      <h1
        className="mb-4 text-[32px] font-semibold leading-[1.15]"
        style={{ color: "var(--ink)" }}
      >
        No more briefing emails.
      </h1>
      <p
        className="mb-8 text-[15px] leading-[1.6]"
        style={{ color: "var(--ink-soft)" }}
      >
        That&apos;s it. Nothing else lands in your inbox from us. You can
        still open the briefing in the app whenever you want, and you can
        turn emails back on any time from settings.
      </p>
      <Link
        href="/app/settings/notifications"
        className="rounded-md px-4 py-2 text-[14px] font-medium underline underline-offset-4"
        style={{ color: "var(--ink)" }}
      >
        Change your mind →
      </Link>
    </main>
  );
}

function NotFoundState() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[520px] flex-col items-center justify-center px-6 py-16 text-center">
      <h1
        className="mb-4 text-[28px] font-semibold leading-[1.15]"
        style={{ color: "var(--ink)" }}
      >
        This link doesn&apos;t match an account.
      </h1>
      <p
        className="mb-8 text-[15px] leading-[1.6]"
        style={{ color: "var(--ink-soft)" }}
      >
        Either you&apos;ve already used it, or it was meant for someone else.
        You can manage your briefing emails from settings.
      </p>
      <Link
        href="/app/settings/notifications"
        className="text-[14px] underline underline-offset-4"
        style={{ color: "var(--ink)" }}
      >
        Open settings →
      </Link>
    </main>
  );
}
