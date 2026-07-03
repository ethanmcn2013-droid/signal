import type { Metadata } from "next";
import { getOrCreatePreferences } from "@/lib/preferences";
import { isDemoMode } from "@/lib/access-mode";
import { CadenceForm } from "./cadence-form";
import { SendTestButton } from "./send-test-button";

export const metadata: Metadata = {
  title: "Notifications, Signal",
  description: "Choose how often you want the briefing in your inbox.",
};

export default async function NotificationsPage() {
  // Demo/Review: synthetic prefs so the surface renders without a session.
  const prefs = isDemoMode()
    ? { email: "you@theorchard.example", cadence: "daily" }
    : await getOrCreatePreferences();

  return (
    <main className="mx-auto w-full max-w-[640px] px-6 py-16">
      <p
        className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: "var(--ink-quiet)" }}
      >
        Settings · Notifications
      </p>
      <h1
        className="mb-3 text-[32px] font-semibold leading-[1.15]"
        style={{ color: "var(--ink)" }}
      >
        How often should the briefing land?
      </h1>
      <p
        className="mb-8 text-[15px] leading-[1.6]"
        style={{ color: "var(--ink-soft)" }}
      >
        Signal sends a short morning briefing to{" "}
        <span style={{ color: "var(--ink)" }}>{prefs.email}</span>. You can
        change this any time. The briefing is always one short read, never
        a feed, never a dashboard. If a day has no real signal, no email is
        sent.
      </p>

      <CadenceForm initial={prefs.cadence as "daily" | "weekly" | "off"} />

      <SendTestButton email={prefs.email} />

      <div
        className="mt-12 rounded-xl border p-5"
        style={{
          borderColor: "var(--line-soft, rgba(20,21,26,0.10))",
          background: "var(--bg-sunken, rgba(20,21,26,0.02))",
        }}
      >
        <p
          className="text-[12.5px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "var(--ink-quiet)" }}
        >
          Our promise
        </p>
        <p
          className="mt-2 text-[14px] leading-[1.6]"
          style={{ color: "var(--ink-soft)" }}
        >
          Every email has a one-click off button in the footer, and a native
          unsubscribe link in the email header (Gmail and Apple Mail surface
          this at the top of the message). We never send anything else from
          this address, no announcements, no upsells. Just the briefing.
        </p>
      </div>
    </main>
  );
}
