"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { STUDIO_URL, ROADMAP_URL, TASKS_URL } from "@/lib/product-urls";

const UMBRELLA_PRICING = "https://signalstudio.ie/pricing";

const NAV: { href: string; label: string; external?: boolean }[] = [
  { href: "/signal",        label: "Signal"  },
  { href: "/method",        label: "Method"  },
  { href: UMBRELLA_PRICING, label: "Pricing", external: true },
  { href: "/about",         label: "About"   },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "color-mix(in srgb, var(--bg) 88%, transparent)",
        backdropFilter: "saturate(160%) blur(10px)",
        WebkitBackdropFilter: "saturate(160%) blur(10px)",
        borderBottomColor: "var(--border-soft)",
      }}
    >
      {/* ── Suite chrome — cross-product strip ──────────────────── */}
      <div
        className="border-b"
        style={{
          background: "color-mix(in srgb, var(--bg-deep) 55%, transparent)",
          borderBottomColor: "var(--border-soft)",
        }}
      >
        <div
          className="mx-auto flex h-7 w-full max-w-[1140px] items-center px-6"
          style={{ gap: 16 }}
        >
          <a
            href={STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, color: "var(--ink-quiet)", fontWeight: 400, textDecoration: "none", letterSpacing: "-0.01em" }}
          >
            signal studio<span style={{ color: "#4f46e5" }}>.</span>
          </a>
          <span aria-hidden style={{ color: "var(--ink-faint)", fontSize: 10 }}>·</span>
          <a
            href={TASKS_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, color: "var(--ink-quiet)", fontWeight: 400, textDecoration: "none", letterSpacing: "-0.01em" }}
          >
            tasks
          </a>
          <a
            href={ROADMAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, color: "var(--ink-quiet)", fontWeight: 400, textDecoration: "none", letterSpacing: "-0.01em" }}
          >
            roadmap
          </a>
          <span style={{ fontSize: 11, color: "var(--ink)", fontWeight: 600, letterSpacing: "-0.01em" }}>
            analytics
          </span>
        </div>
      </div>

      <div className="mx-auto flex h-14 w-full max-w-[1140px] items-center justify-between px-6">

        {/* Brand lockup — Analytics wordmark */}
        <div className="flex items-center">
          <Wordmark size="0.9375rem" />
        </div>

        {/* Desktop nav — right cluster */}
        <nav className="hidden items-center md:flex" style={{ gap: 28 }}>
          {NAV.map((item) => {
            const active = !item.external && pathname === item.href;
            const linkStyle: React.CSSProperties = {
              fontSize: 13.5,
              color: active ? "var(--ink)" : "var(--ink-soft)",
              fontWeight: active ? 600 : 400,
              textDecoration: "none",
              transition: "color 200ms",
            };
            return item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} style={linkStyle}>
                {item.label}
              </Link>
            );
          })}

        </nav>

        {/* Mobile nav — native <details> for restraint */}
        <details className="relative md:hidden">
          <summary
            className="cursor-pointer list-none transition-colors"
            style={{
              fontSize: 13,
              color: "var(--ink-soft)",
              userSelect: "none",
            }}
          >
            Menu
          </summary>
          <div
            className="absolute right-0 top-8 min-w-[160px] py-2"
            style={{
              borderRadius: "var(--r-3)",
              border: "1px solid var(--border-soft)",
              boxShadow: "var(--shadow-2)",
              background: "var(--bg-elev)",
            }}
          >
            {NAV.map((item) => {
              const active = !item.external && pathname === item.href;
              const linkStyle: React.CSSProperties = {
                fontSize: 13.5,
                color: active ? "var(--ink)" : "var(--ink-soft)",
                fontWeight: active ? 600 : 400,
                textDecoration: "none",
                transition: "color 200ms",
              };
              return item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2"
                  style={linkStyle}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2"
                  style={linkStyle}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </details>
      </div>
    </header>
  );
}
