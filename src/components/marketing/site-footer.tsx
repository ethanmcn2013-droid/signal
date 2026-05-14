import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import {
  NOTES_URL,
  ROADMAP_URL,
  STUDIO_URL,
  TASKS_URL,
} from "@/lib/product-urls";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border-soft pb-10 pt-16">
      <div className="mx-auto grid w-full max-w-[1240px] gap-10 px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Wordmark size="1.25rem" />
          <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-ink-soft">
            Operational clarity for teams that already know what to do.
          </p>
          <p className="mt-4 text-[12px] text-ink-quiet">
            A{" "}
            <a
              href={STUDIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink-soft transition-colors hover:text-ink"
            >
              Signal Studio
            </a>{" "}
            product.
          </p>
        </div>
        <FooterCol
          heading="Product"
          links={[
            { href: "/signal", label: "Signal" },
            { href: "/method", label: "Method" },
            { href: "https://signalstudio.ie/pricing", label: "Pricing", external: true },
          ]}
        />
        <FooterCol
          heading="Resources"
          links={[
            { href: "https://signalstudio.ie/dispatch", label: "Dispatch", external: true },
            { href: "/about", label: "About" },
            { href: "https://signalstudio.ie/contact", label: "Contact", external: true },
          ]}
        />
        <FooterCol
          heading="Suite"
          links={[
            { href: STUDIO_URL,  label: "Signal Studio",   external: true },
            { href: TASKS_URL,   label: "Signal Tasks",    external: true },
            { href: ROADMAP_URL, label: "Signal Roadmap",  external: true },
            { href: NOTES_URL,   label: "Signal Notes",    external: true },
          ]}
        />
      </div>
      <div className="mx-auto mt-12 flex w-full max-w-[1240px] flex-col items-start justify-between gap-2 border-t border-border-soft px-6 pt-6 text-[12px] text-ink-quiet md:flex-row md:items-center">
        <span>© {new Date().getFullYear()} Signal Analytics. A Signal Studio product.</span>
        <span>Clarity, not configuration.</span>
      </div>
      <div
        className="mx-auto mt-4 flex w-full max-w-[1240px] flex-wrap items-center gap-x-1 gap-y-1 px-6 font-mono text-[12px] uppercase tracking-[0.08em] text-ink-quiet"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <a href="https://signalstudio.ie/privacy" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[32px] items-center px-2 py-1 transition-colors hover:text-ink">Privacy</a>
        <span aria-hidden className="opacity-50">·</span>
        <a href="https://signalstudio.ie/terms" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[32px] items-center px-2 py-1 transition-colors hover:text-ink">Terms</a>
        <span aria-hidden className="opacity-50">·</span>
        <a href="https://signalstudio.ie/security" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[32px] items-center px-2 py-1 transition-colors hover:text-ink">Security</a>
        <span aria-hidden className="opacity-50">·</span>
        <a href="https://signalstudio.ie/accessibility" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[32px] items-center px-2 py-1 transition-colors hover:text-ink">Accessibility</a>
      </div>
    </footer>
  );
}

function FooterCol({
  heading,
  links,
}: {
  heading: string;
  links: { href: string; label: string; external?: boolean }[];
}) {
  return (
    <div>
      <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-quiet">
        {heading}
      </div>
      <ul className="space-y-2 text-[13.5px] text-ink-soft">
        {links.map((l) => (
          <li key={l.label}>
            {l.external ? (
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ) : (
              <Link
                href={l.href}
                className="transition-colors hover:text-ink"
              >
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
