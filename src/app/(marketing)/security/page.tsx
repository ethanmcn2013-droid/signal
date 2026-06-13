import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security — Signal",
  description:
    "How Signal will handle your operational data when the product ships. The posture we are building toward.",
};

const LAST_UPDATED = "2026-05-09";

/**
 * /security — plain-English statement of Signal's security
 * posture as it is being built. Forward-looking — the product is in
 * private beta and does not yet collect operational data.
 * Static — no client-only code.
 */
export default function SecurityPage() {
  return (
    <article className="mx-auto w-full max-w-[720px] px-6 py-20">
      {/* Eyebrow */}
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
        Security
      </div>

      {/* H1 */}
      <h1 className="mt-3 text-balance text-[clamp(2rem,1.4rem+2.4vw,3.4rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-ink">
        How we&rsquo;ll keep your work private.
      </h1>

      {/* Sub */}
      <p className="mt-4 text-[17px] leading-[1.55] text-ink-soft">
        Signal is in private beta. Here is the security posture
        we are building toward.
      </p>

      {/* Timestamp */}
      <p className="mt-3 text-[12.5px] tabular-nums text-ink-quiet">
        Last updated {LAST_UPDATED}
      </p>

      <div className="mt-10 space-y-8 text-[15.5px] leading-[1.65] text-ink-soft">
        <Section title="What we will collect">
          <p>
            When Signal ships, it will capture a snapshot of
            your work-in-progress signals — titles, statuses, and
            dates from the tools you connect. It will not capture the
            contents of documents or task descriptions. It will not
            collect personally identifiable information beyond your
            account email unless you explicitly opt in to something
            that requires it.
          </p>
        </Section>

        <Section title="How it will be stored">
          <p>
            Data will be encrypted at rest. Connections will run over
            HTTPS with no plaintext fallbacks. We will offer regional
            data residency on request for teams where that matters. The
            hosting layer is{" "}
            <ExternalLink href="https://vercel.com/security">
              Vercel
            </ExternalLink>
            , which handles the edge network, DDoS protection, and
            infrastructure-level audit work.
          </p>
        </Section>

        <Section title="Sign-in">
          <p>
            Sign-in is handled by{" "}
            <ExternalLink href="https://clerk.com/security">
              Clerk
            </ExternalLink>
            , which is SOC 2 Type II audited. Your password never
            reaches our servers — Clerk does the hashing, the rotation,
            and the breach detection.
          </p>
        </Section>

        <Section title="What we will not do">
          <p>
            No AI training on your operational data. No third-party
            advertising or tracking on any page of the product. No
            selling of your data to anyone. No different security
            posture for a paid tier versus a free one — the same
            encryption and audit trail applies regardless of what is
            on the invoice.
          </p>
        </Section>

        <Section title="What you will control">
          <p>
            You will be able to delete your account at any time, with
            immediate and permanent removal of your data. You will be
            able to revoke any connection to a third-party tool without
            affecting the rest of your setup. You will be able to
            export everything in a portable format before you leave.
          </p>
        </Section>

        <Section title="Beta-stage disclosure">
          <p>
            Until Signal is generally available, this page
            describes the posture we are building toward, not a current
            operational commitment. The formal security policy — with
            specific retention periods, subprocessor list, and legal
            language — lands at general availability.
          </p>
          <p>
            The marketing site you are reading right now collects no
            operational data. Sign-in is gated to invited users only.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions or disclosures:{" "}
            <ExternalLink href="mailto:hello@signalstudio.ie">
              hello@signalstudio.ie
            </ExternalLink>
            . We respond within 72 hours.
          </p>
        </Section>

        <p className="border-t border-border-soft pt-6 text-[14px] text-ink-quiet">
          Security is a process, not a label.
        </p>
      </div>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-[20px] font-semibold tracking-[-0.015em] text-ink">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-ink underline decoration-1 underline-offset-2 transition-opacity hover:opacity-70"
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
    >
      {children}
    </a>
  );
}
