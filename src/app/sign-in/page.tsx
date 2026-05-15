import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign in — Signal Analytics",
};

const shell = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  padding: "64px 24px",
  background: "var(--bg)",
};

export default function SignInPage() {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!hasClerk) {
    return (
      <main style={shell}>
        <p
          style={{
            fontSize: 17,
            color: "var(--ink-soft)",
            lineHeight: 1.55,
          }}
        >
          Sign-in opens when invited.
        </p>
      </main>
    );
  }

  return (
    <main style={shell}>
      <SignIn routing="hash" signUpUrl="/sign-up" fallbackRedirectUrl="/app/brief" />
    </main>
  );
}
