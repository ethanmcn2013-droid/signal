import { auth } from "@clerk/nextjs/server";
import { render } from "@react-email/render";
import { buildBriefing } from "@/lib/briefing/build";
import { mockBriefingSource } from "@/lib/briefing/mock-source";
import { BriefingEmail } from "@/lib/email/briefing-email";

export const metadata = {
  title: "Email preview — Signal Analytics",
};

/**
 * Visual QA for the email render. Renders the same React Email
 * component that the cron handler will dispatch, embedded into a
 * frame so you can see exactly what Gmail will see.
 *
 * This page is the only place that catches Outlook/Gmail layout
 * regressions before they hit your subscribers' inboxes. Visit
 * this before every meaningful Phase C change.
 */
export default async function PreviewEmailPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <main className="mx-auto max-w-[640px] px-6 py-16">Not signed in.</main>
    );
  }

  const briefing = await buildBriefing(mockBriefingSource, userId);
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://analytics.signalstudio.ie";

  const html = await render(
    BriefingEmail({
      briefing,
      unsubscribeUrl: `${base}/u/preview-token`,
      preferencesUrl: `${base}/app/settings/notifications`,
      viewInBrowserUrl: `${base}/app/brief`,
      cadence: "daily",
    }),
  );

  return (
    <main className="mx-auto w-full max-w-[820px] px-6 py-10">
      <p
        className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: "var(--ink-quiet)" }}
      >
        Preview · Email render (mock data, no send)
      </p>
      <h1
        className="mb-6 text-[24px] font-semibold leading-[1.2]"
        style={{ color: "var(--ink)" }}
      >
        This is exactly what Gmail will see.
      </h1>
      <iframe
        srcDoc={html}
        title="Briefing email preview"
        sandbox=""
        style={{
          width: "100%",
          height: "85vh",
          border: "1px solid var(--line-soft, rgba(20,21,26,0.10))",
          borderRadius: 12,
          background: "#fafafb",
        }}
      />
    </main>
  );
}
