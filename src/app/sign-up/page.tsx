import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up — Signal Analytics",
};

export default function SignUpPage() {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!hasClerk) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 24px",
          background: "var(--bg)",
        }}
      >
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

  return null;
}
