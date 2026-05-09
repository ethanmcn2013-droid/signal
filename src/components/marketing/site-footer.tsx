import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { STUDIO_URL, TASKS_URL, ROADMAP_URL } from "@/lib/product-urls";

export function SiteFooter() {
  return (
    <footer
      style={{
        marginTop: 120,
        borderTop: "1px solid var(--border-soft)",
        paddingTop: 64,
        paddingBottom: 40,
        background: "var(--bg)",
      }}
    >
      <div
        className="mx-auto w-full max-w-[1140px] px-6"
        style={{
          display: "grid",
          gap: 48,
          gridTemplateColumns: "1fr",
        }}
      >
        {/* Responsive grid — single col → 2-col → 4-col */}
        <div
          style={{
            display: "grid",
            gap: "40px 48px",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          }}
        >
          {/* Brand column */}
          <div style={{ gridColumn: "span 2" }}>
            <Wordmark size="0.9375rem" />
            <p
              style={{
                marginTop: 16,
                maxWidth: 220,
                fontSize: 13.5,
                lineHeight: 1.6,
                color: "var(--ink-soft)",
              }}
            >
              Operational clarity for teams that already know what to do.
            </p>
            <p style={{ marginTop: 12, fontSize: 12, color: "var(--ink-quiet)" }}>
              A{" "}
              <a
                href={STUDIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--ink-soft)",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "color 200ms",
                }}
              >
                signal studio.
              </a>{" "}
              product.
            </p>
          </div>

          <FooterCol
            heading="Product"
            links={[
              { href: "/signal",  label: "Signal"  },
              { href: "/method",  label: "Method"  },
              { href: "/pricing", label: "Pricing" },
            ]}
          />

          <FooterCol
            heading="Company"
            links={[
              { href: "/about",   label: "About"   },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms",   label: "Terms"   },
            ]}
          />

          <FooterCol
            heading="Suite"
            links={[
              { href: STUDIO_URL,  label: "Signal Studio",  external: true },
              { href: TASKS_URL,   label: "Signal Tasks",   external: true },
              { href: ROADMAP_URL, label: "Signal Roadmap", external: true },
            ]}
          />
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="mx-auto mt-12 w-full max-w-[1140px] px-6"
        style={{
          paddingTop: 20,
          borderTop: "1px solid var(--border-soft)",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontFamily: "var(--font-mono-stack)",
            color: "var(--ink-faint)",
            letterSpacing: "0.02em",
          }}
        >
          &copy; 2026 Signal Studio
        </span>
        <span
          style={{
            fontSize: 11,
            fontFamily: "var(--font-mono-stack)",
            color: "var(--ink-faint)",
            letterSpacing: "0.02em",
          }}
        >
          Built for clarity, not configuration.
        </span>
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
      <div
        style={{
          marginBottom: 14,
          fontSize: 11,
          fontFamily: "var(--font-mono-stack)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "var(--ink-quiet)",
        }}
      >
        {heading}
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map((l) => (
          <li key={l.label}>
            {l.external ? (
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 13.5,
                  color: "var(--ink-soft)",
                  textDecoration: "none",
                  transition: "color 200ms",
                }}
              >
                {l.label} ↗
              </a>
            ) : (
              <Link
                href={l.href}
                style={{
                  fontSize: 13.5,
                  color: "var(--ink-soft)",
                  textDecoration: "none",
                  transition: "color 200ms",
                }}
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
