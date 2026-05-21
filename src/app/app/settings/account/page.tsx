import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DangerZone } from "@/components/account/danger-zone";

export const metadata: Metadata = {
  title: "Account — Signal Analytics",
  description: "Account management.",
};

/**
 * /app/settings/account
 *
 * Sits alongside /app/settings/notifications as the second settings
 * surface. Only thing here today is the App-Store-mandatory account
 * deletion path.
 */
export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const email =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? "";

  return (
    <main className="mx-auto w-full max-w-[640px] px-6 py-16">
      <p
        className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: "var(--ink-quiet)" }}
      >
        Settings · Account
      </p>
      <h1
        className="mb-3 text-[32px] font-semibold leading-[1.15]"
        style={{ color: "var(--ink)" }}
      >
        Your Signal account
      </h1>
      <p
        className="mb-8 max-w-[560px] text-[15px] leading-[1.6]"
        style={{ color: "var(--ink-soft)" }}
      >
        Signed in as{" "}
        <span style={{ color: "var(--ink)" }}>{email}</span>. Profile,
        password, and sign-in methods live in your Clerk account — the
        destructive action below is the only thing Analytics controls
        directly.
      </p>

      <DangerZone email={email} />
    </main>
  );
}
