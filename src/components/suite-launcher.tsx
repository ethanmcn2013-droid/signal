"use client";

import { useEffect, useRef, useState } from "react";
import {
  SIGNAL_URL,
  NOTES_URL,
  TIMELINE_URL,
  STUDIO_URL,
  TASKS_URL,
} from "@/lib/product-urls";

type ProductSlug = "tasks" | "roadmap" | "notes" | "analytics";

// ── Unauthed: marketing taglines, marketing homepages ──────────────────────
// Product order (operator-directed 2026-05-18): notes → tasks → roadmap → analytics
const PRODUCTS_UNAUTHED: {
  slug: ProductSlug;
  word: string;
  tagline: string;
  url: string;
}[] = [
  { slug: "notes",     word: "notes",     tagline: "Capture clarity",    url: NOTES_URL },
  { slug: "tasks",     word: "tasks",     tagline: "Execution clarity",  url: TASKS_URL },
  { slug: "roadmap",   word: "timeline",   tagline: "Direction clarity",  url: TIMELINE_URL },
  { slug: "analytics", word: "signal", tagline: "Attention clarity",  url: SIGNAL_URL },
];

// ── Authed: app-context labels, app entry deep-links ──────────────────────
// Labels: §1C canon (lowercase product noun). Order: same as above.
const PRODUCTS_AUTHED: {
  slug: ProductSlug;
  word: string;
  label: string;
  url: string;
}[] = [
  { slug: "notes",     word: "notes",     label: "Open notes",     url: `${NOTES_URL}/app` },
  { slug: "tasks",     word: "tasks",     label: "Open tasks",     url: `${TASKS_URL}/app` },
  { slug: "roadmap",   word: "timeline",   label: "Open timeline",   url: `${TIMELINE_URL}/app` },
  { slug: "analytics", word: "signal", label: "Open signal", url: `${SIGNAL_URL}/app` },
];

const INDIGO = "#4f46e5";

const PRODUCT_ORIGINS = [NOTES_URL, TASKS_URL, TIMELINE_URL, SIGNAL_URL];

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
 * Phase 3 dot-morph: the brand transition between products. The indigo
 * dot blooms over a paper field, then we navigate same-tab — the suite
 * feels like one surface re-skinning, not four apps. Pure DOM so it is
 * style-system agnostic. Reduced-motion + modifier clicks skip this at
 * the call site (normal same-tab nav). ~380ms, then location.href.
 */
function suiteJump(url: string) {
  if (typeof document === "undefined") {
    window.location.href = url;
    return;
  }
  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;background:#ffffff;opacity:0;" +
    "transition:opacity 260ms cubic-bezier(.32,0,.67,1);display:flex;" +
    "align-items:center;justify-content:center;pointer-events:none";
  const dot = document.createElement("div");
  dot.style.cssText =
    `width:9px;height:9px;border-radius:50%;background:${INDIGO};` +
    "transform:scale(1);transition:transform 360ms cubic-bezier(.32,0,.67,1)";
  overlay.appendChild(dot);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
    dot.style.transform = "scale(28)";
  });
  window.setTimeout(() => {
    window.location.href = url;
  }, 380);
}

/**
 * Signal suite launcher — canonical SuiteLauncher per IA_COHERENCE.md §2.
 *
 * Replaces SuiteLauncherAuthAware (retired). isAuthed prop switches:
 *   - product list:  unauthed = taglines + marketing URLs
 *                    authed   = "Open X" labels + /app deep-links
 *   - footer link:   unauthed = "Visit signalstudio.ie →" (new tab)
 *                    authed   = "Back to Signal Studio →" (same tab)
 *
 * Trigger always renders "signal studio." (no "Products ▾", no Unicode
 * caret) — P2-5 conformance.
 *
 * Inline-style approach matches Signal's CSS-variable design system.
 */
export function SuiteLauncher({
  current,
  isAuthed = false,
}: {
  current: ProductSlug;
  isAuthed?: boolean;
}) {
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
          transition: "color var(--motion-fast)",
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
            {(isAuthed ? PRODUCTS_AUTHED : PRODUCTS_UNAUTHED).map((p) => {
              const isCurrent = p.slug === current;
              const label = isAuthed
                ? (p as typeof PRODUCTS_AUTHED[number]).label
                : (p as typeof PRODUCTS_UNAUTHED[number]).tagline;
              return (
                <li key={p.slug}>
                  <a
                    href={p.url}
                    onMouseEnter={(e) => {
                      if (isCurrent) return;
                      prefetchProduct(p.url);
                      e.currentTarget.style.background =
                        "color-mix(in srgb, var(--ink) 5%, transparent)";
                    }}
                    onFocus={
                      isCurrent ? undefined : () => prefetchProduct(p.url)
                    }
                    aria-current={isCurrent ? "true" : undefined}
                    role="menuitem"
                    onClick={(e) => {
                      setOpen(false);
                      if (isCurrent) return;
                      if (
                        e.metaKey ||
                        e.ctrlKey ||
                        e.shiftKey ||
                        e.altKey ||
                        window.matchMedia("(prefers-reduced-motion: reduce)")
                          .matches
                      )
                        return;
                      e.preventDefault();
                      suiteJump(p.url);
                    }}
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
                      transition: "background var(--motion-instant)",
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
                        {label}
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
          {/* Footer — §1F: authed="Back to Signal Studio →" same-tab;
              unauthed="Visit signalstudio.ie →" new tab */}
          {isAuthed ? (
            <a
              href={STUDIO_URL}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                borderTop: "1px solid var(--border-soft)",
                padding: "10px 14px",
                fontSize: 11,
                color: "var(--ink-quiet)",
                textDecoration: "none",
                transition: "background var(--motion-instant), color var(--motion-instant)",
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
              Back to Signal Studio →
            </a>
          ) : (
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
                transition: "background var(--motion-instant), color var(--motion-instant)",
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
          )}
        </div>
      ) : null}
    </div>
  );
}
