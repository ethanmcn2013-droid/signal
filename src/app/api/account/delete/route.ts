import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { deleteAccountForUser } from "@/server/account";

/**
 * POST /api/account/delete — Signal.
 *
 * In-app account deletion per App Store 5.1.1(v). See
 * `~/Projects/personal/studio/docs/ios/data-flow.md` for the
 * canonical flow doc.
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await deleteAccountForUser(userId);

    const client = await clerkClient();
    await client.users.deleteUser(userId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "delete_failed", message },
      { status: 500 },
    );
  }
}
