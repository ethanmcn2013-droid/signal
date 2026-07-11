"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { db } from "@/server/db";
import { analyticsUsers } from "@/server/db/schema";
import { dataSource } from "@/lib/data/source";

/**
 * Onboarding writes. Called by the workspace picker.
 *
 * Both fields land in the same upsert so the row is always coherent
 * (no half-onboarded state with a workspace but no timezone, or vice
 * versa). The client always sends both.
 */
export async function completeOnboarding(formData: FormData): Promise<void> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const workspaceId = String(formData.get("workspaceId") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();

  if (!workspaceId) {
    throw new Error("Pick a workspace.");
  }
  if (!timezone) {
    throw new Error("Time zone is required.");
  }

  // Verify the workspace is one the user can actually brief. Defends
  // against a tampered formData replaying a workspace id the user
  // doesn't have access to. Email is passed only for display/delivery;
  // the data source authorizes by immutable clerkId.
  const me = await currentUser();
  const email = me?.primaryEmailAddress?.emailAddress ?? null;
  const candidates = await dataSource.listForUser({ clerkId: userId, email });
  const allowed = candidates.some((c) => c.workspaceId === workspaceId);
  if (!allowed) {
    throw new Error("That workspace isn't linked to your account.");
  }

  await db
    .insert(analyticsUsers)
    .values({
      clerkId: userId,
      linkedWorkspaceId: workspaceId,
      timezone,
    })
    .onConflictDoUpdate({
      target: analyticsUsers.clerkId,
      set: {
        linkedWorkspaceId: workspaceId,
        timezone,
        updatedAt: sql`(unixepoch())`,
      },
    });

  redirect("/app");
}
