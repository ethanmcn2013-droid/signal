import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — Signal Analytics",
  description:
    "We see your work so the system can write the briefing. We don't share it. We don't sell it.",
};

const SECTIONS = [
  {
    title: "What we collect",
    body: "Signal Analytics reads the structure and state of your work — tasks, projects, project activity, deadlines, and updates. We collect what is necessary to generate the briefing and nothing more.",
  },
  {
    title: "How we use it",
    body: "Your data is used exclusively to generate your briefings. It is not used to train models shared across customers, not used for benchmarking across customers, not used for any purpose other than producing the output you asked for.",
  },
  {
    title: "What we don't do",
    body: "We do not sell your data. We do not share it with third parties for advertising or analytics purposes. We do not retain it beyond what is required to maintain your account and briefing history.",
  },
  {
    title: "How to delete your data",
    body: "Email hello@signalstudio.ie with the subject \"Delete my data\" and we will remove everything associated with your account within 30 days. When the product is generally available, this will be handled in-product.",
  },
] as const;

const PROSE_MAX = { maxWidth: 640, margin: "0 auto", paddingLeft: 24, paddingRight: 24 };

export default function PrivacyPage() {
  return (
    <div style={{ background: "var(--bg)", paddingBottom: 120 }}>
      <section style={{ paddingTop: 120, paddingBottom: 0 }}>
        <div style={PROSE_MAX}>
          <h1 className="h-title" style={{ marginBottom: 24 }}>
            Privacy.
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "var(--ink-soft)",
              lineHeight: 1.6,
              maxWidth: 520,
              marginBottom: 72,
            }}
          >
            We see your work so the system can write the briefing. We don&apos;t share
            it. We don&apos;t sell it. Here&apos;s what that means concretely.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            {SECTIONS.map((s) => (
              <div key={s.title} style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 32 }}>
                <h2
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--ink)",
                    marginBottom: 12,
                  }}
                >
                  {s.title}
                </h2>
                <p style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.65, margin: 0 }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          <p
            style={{
              marginTop: 72,
              fontSize: 12,
              fontFamily: "var(--font-mono-stack)",
              color: "var(--ink-quiet)",
              lineHeight: 1.6,
            }}
          >
            This page is a placeholder while the product is in private beta.
            The formal policy lands when Signal Analytics is generally available.
          </p>
        </div>
      </section>
    </div>
  );
}
