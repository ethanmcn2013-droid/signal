import type { Metadata } from "next";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign up — Signal",
};

export default function SignUpPage() {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!hasClerk) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 17,
            color: "var(--ink-soft)",
            lineHeight: 1.55,
            marginBottom: 16,
          }}
        >
          Sign-up opens when invited.
        </p>
        <Link
          href="/pricing"
          style={{
            fontSize: 14,
            color: "var(--ink-quiet)",
            textDecoration: "underline",
          }}
        >
          Request access
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
      }}
    >
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#4f46e5",
            colorBackground: "#fafaf7",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          },
        }}
        signInUrl="/sign-in"
        forceRedirectUrl="/app"
      />
    </div>
  );
}
