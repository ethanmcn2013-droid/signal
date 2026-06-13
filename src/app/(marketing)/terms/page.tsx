import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms — Signal",
  description:
    "Terms of use for Signal. Plain English, no legalese.",
};

const SECTIONS = [
  {
    title: "What this is",
    body: "Signal is a private beta product operated by Signal Studio. By requesting access and using the service, you agree to use it for legitimate work purposes. That's the main point.",
  },
  {
    title: "What we provide",
    body: "We provide a briefing service that reads the state of your connected work and surfaces what deserves your attention. We do not guarantee uptime, completeness, or accuracy during the beta period. We will tell you when something is wrong.",
  },
  {
    title: "What you own",
    body: "Your data is yours. Your tasks, projects, team information, and work history belong to you. We do not claim any rights to the content of your work, only the right to process it to generate your briefings.",
  },
  {
    title: "Changes and cancellation",
    body: "We may change or discontinue the service with reasonable notice. During the beta, access can be revoked if the product is not a fit. You can cancel at any time by emailing hello@signalstudio.ie.",
  },
] as const;

const PROSE_MAX = { maxWidth: 640, margin: "0 auto", paddingLeft: 24, paddingRight: 24 };

export default function TermsPage() {
  return (
    <div style={{ background: "var(--bg)", paddingBottom: 120 }}>
      <section style={{ paddingTop: 120, paddingBottom: 0 }}>
        <div style={PROSE_MAX}>
          <h1 className="h-title" style={{ marginBottom: 24 }}>
            Terms.
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
            Plain English. No legalese. The formal terms land when the product is
            generally available.
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
            The formal terms land when Signal is generally available.
          </p>
        </div>
      </section>
    </div>
  );
}
