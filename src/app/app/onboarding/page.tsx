import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { dataSource } from "@/lib/data/source";
import { isOnboarded } from "@/server/onboarding/queries";
import { TASKS_URL } from "@/lib/product-urls";
import { OnboardingPicker } from "./picker";

/**
 * Onboarding, workspace mapping.
 *
 * Auto-detect-with-override pattern. The picker UI handles all three
 * cases (0 / 1 / many candidates) so the user always sees one clear
 * surface. Time zone is captured from the browser at the same step.
 *
 * Bounce out if the user is already onboarded (e.g. visiting the URL
 * directly after they've already linked).
 */
export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  if (await isOnboarded(userId)) {
    redirect("/app");
  }

  // Resolve email for display/delivery only; authorization uses clerkId.
  // currentUser() is a separate Clerk call but runs server-side; the cost
  // is acceptable here, onboarding is a one-time flow.
  const me = await currentUser();
  const email = me?.primaryEmailAddress?.emailAddress ?? null;

  const candidates = await dataSource.listForUser({ clerkId: userId, email });

  return (
    <div
      className="mx-auto w-full max-w-[560px] px-6"
      style={{ paddingTop: 64, paddingBottom: 96 }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono-stack)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--ink-quiet)",
          marginBottom: 14,
        }}
      >
        Onboarding
      </div>
      <h1
        style={{
          fontSize: "clamp(28px, 4vw, 36px)",
          letterSpacing: "-0.035em",
          lineHeight: 1.08,
          fontWeight: 600,
          color: "var(--ink)",
          marginBottom: 12,
        }}
      >
        {candidates.length === 0
          ? "We couldn't find a workspace."
          : candidates.length === 1
          ? "We found your workspace."
          : "Pick the workspace to brief."}
      </h1>
      <p
        style={{
          fontSize: 17,
          lineHeight: 1.55,
          color: "var(--ink-soft)",
          marginBottom: 32,
        }}
      >
        {candidates.length === 0
          ? "Your briefing reads from a Signal Tasks workspace. Sign up at Tasks or get added to one, then come back."
          : "Your briefing reads from this workspace each morning. You can change it later."}
      </p>

      {candidates.length === 0 ? (
        <div
          style={{
            padding: 20,
            borderRadius: "var(--r-3)",
            border: "1px solid var(--border-soft)",
            background: "var(--bg-elev)",
          }}
        >
          <a
            href={TASKS_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 14,
              color: "var(--brand)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Open Signal Tasks ↗
          </a>
          <p
            style={{
              marginTop: 10,
              fontSize: 13,
              color: "var(--ink-quiet)",
              lineHeight: 1.55,
            }}
          >
            Once you have a workspace,{" "}
            <a
              href="/app/onboarding"
              style={{ color: "var(--ink-soft)", textDecoration: "underline" }}
            >
              come back to this tab and try again
            </a>
            .
          </p>
        </div>
      ) : (
        <OnboardingPicker candidates={candidates} />
      )}
    </div>
  );
}
