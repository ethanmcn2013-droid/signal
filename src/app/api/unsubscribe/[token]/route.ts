import { NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/preferences";

// One-click POST handler for the RFC 8058 `List-Unsubscribe-Post` header.
// Gmail and Apple Mail call this endpoint when the user taps the native
// "Unsubscribe" button at the top of the message.
//
// Per RFC 8058: must succeed without auth, must be idempotent.
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  await unsubscribeByToken(token);
  return new NextResponse(null, { status: 200 });
}

// GET is also valid per List-Unsubscribe (mailto: alternative omitted).
// Redirect to the human-facing /u/[token] landing.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  return NextResponse.redirect(
    new URL(
      `/u/${encodeURIComponent(token)}`,
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://signal.signalstudio.ie",
    ),
  );
}
