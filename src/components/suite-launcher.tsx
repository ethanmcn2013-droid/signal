"use client";

import { useEffect, useRef, useState } from "react";
import {
  ANALYTICS_URL,
  NOTES_URL,
  ROADMAP_URL,
  STUDIO_URL,
  TASKS_URL,
} from "@/lib/product-urls";

type ProductSlug = "tasks" | "roadmap" | "notes" | "analytics";

const PRODUCTS: {
  slug: ProductSlug;
  word: string;
  tagline: string;
  url: string;
}[] = [
  { slug: "tasks", word: "tasks", tagline: "Execution clarity", url: TASKS_URL },
  { slug: "roadmap", word: "roadmap", tagline: "Direction clarity", url: ROADMAP_URL },
  { slug: "notes", word: "notes", tagline: "Capture clarity", url: NOTES_URL },
  { slug: "analytics", word: "analytics", tagline: "Attention clarity", url: ANALYTICS_URL },
];

const INDIGO = "#4f46e5";

const PRODUCT_ORIGINS = [TASKS_URL, ROADMAP_URL, NOTES_URL, ANALYTICS_URL];

/**
 * Phase 3 (instant-jump): warm a sibling product on hover/focus so the
 * same-tab jump lands already-resolved. One <link rel="prefetch"> per
 * URL, deduped. Cross-origin prefetch warms DNS/TLS + the document.
 */
function prefetchProduct(url: string) {
  if (typeof document === "undefined") return;
  if (document.head.querySelector(`link[data-suite-prefetch="${url}"]`)) return;
  const l = document.createElement("link");
  l.rel = "prefetch";
  l.href = url;
  l.as = "document";
  l.setAttribute("data-suite-prefetch", url);
  document.head.appendChild(l);
}

/**
 * Analytics-flavoured suite launcher. Same chrome contract as the
 * Tasks/Roadmap/Notes versions — `signal studio.` text becomes a
 * click-to-open popover listing all four products with a HERE tag on
 * the current one. Inline-style approach matches Analytics's CSS-
 * variable design system (no Tailwind ink tokens here).
 */
export function SuiteLauncher({ current }: { current: ProductSlug }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Phase 3 (instant-jump): on open, preconnect every sibling origin so
  // the first cross-product hop has a warm TLS connection ready.
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    for (const origin of PRODUCT_ORIGINS) {
      if (
        document.head.querySelector(`link[data-suite-preconnect="${origin}"]`)
      )
        continue;
      const l = document.createElement("link");
      l.rel = "preconnect";
      l.href = origin;
      l.crossOrigin = "";
      l.setAttribute("data-suite-preconnect", origin);
      document.head.appendChild(l);
    }
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open Signal Studio launcher"
        style={{
          fontSize: 12,
          color: "var(--ink-quiet)",
          fontWeight: 400,
          textDecoration: "none",
          letterSpacing: "-0.01em",
          transition: "color 200ms",
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-quiet)")}
      >
        signal studio<span style={{ color: INDIGO }}>.</span>
      </button>
      {open ? (
        <div
          role="menu"
          style={{
            position: "absolute",
            left: 0,
            top: "100%",
            zIndex: 50,
            marginTop: 8,
            width: 280,
            overflow: "hidden",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--bg)",
            boxShadow: "0 24px 60px -24px rgba(20,21,26,0.22)",
          }}
        >
          <div
            style={{
              borderBottom: "1px solid var(--border-soft)",
              padding: "10px 14px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "-0.005em",
                color: "var(--ink-soft)",
              }}
            >
              Signal Studio
            </div>
            <div
              style={{ marginTop: 2, fontSize: 10.5, color: "var(--ink-quiet)" }}
            >
              Four products, one studio.
            </div>
          </div>
          <ul style={{ padding: 4, listStyle: "none", margin: 0 }}>
            {PRODUCTS.map((p) => {
              const isCurrent = p.slug === current;
              return (
                <li key={p.slug}>
                  <a
                    href={p.url}
                    onMouseEnter={
                      isCurrent ? undefined : () => prefetchProduct(p.url)
                    }
                    onFocus={
                      isCurrent ? undefined : () => prefetchProduct(p.url)
                    }
                    aria-current={isCurrent ? "true" : undefined}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      borderRadius: 6,
                      padding: "8px 10px",
                      textDecoration: "none",
                      color: isCurrent ? "var(--ink-quiet)" : "var(--ink)",
                      background: isCurrent
                        ? "color-mix(in srgb, var(--ink) 4%, transparent)"
                        : "transparent",
                      transition: "background 120ms",
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrent)
                        e.currentTarget.style.background =
                          "color-mix(in srgb, var(--ink) 5%, transparent)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {p.word}
                        <span style={{ color: INDIGO }}>·</span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 400,
                          color: "var(--ink-quiet)",
                        }}
                      >
                        {p.tagline}
                      </div>
                    </div>
                    {isCurrent ? (
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.14em",
                          color: "var(--ink-faint)",
                        }}
                      >
                        here
                      </span>
                    ) : null}
                  </a>
                </li>
              );
            })}
          </ul>
          <a
            href={STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            style={{
              display: "block",
              borderTop: "1px solid var(--border-soft)",
              padding: "10px 14px",
              fontSize: 11,
              color: "var(--ink-quiet)",
              textDecoration: "none",
              transition: "background 120ms, color 120ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "color-mix(in srgb, var(--ink) 4%, transparent)";
              e.currentTarget.style.color = "var(--ink)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--ink-quiet)";
            }}
          >
            Visit signalstudio.ie →
          </a>
        </div>
      ) : null}
    </div>
  );
}
