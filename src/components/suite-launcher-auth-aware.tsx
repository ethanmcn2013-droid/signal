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

// ── Unauthed product entries (marketing taglines, marketing homepages) ─────
const PRODUCTS_UNAUTHED: {
  slug: ProductSlug;
  word: string;
  tagline: string;
  url: string;
}[] = [
  { slug: "tasks",     word: "tasks",     tagline: "Execution clarity",  url: TASKS_URL },
  { slug: "roadmap",   word: "roadmap",   tagline: "Direction clarity",  url: ROADMAP_URL },
  { slug: "notes",     word: "notes",     tagline: "Capture clarity",    url: NOTES_URL },
  { slug: "analytics", word: "analytics", tagline: "Attention clarity",  url: ANALYTICS_URL },
];

// ── Authed product entries (app-context labels, app entry deep-links) ──────
// §14: "Each product entry deep-links to that product's app entry, not its
// marketing homepage." Labels: "Open the workspace" / "Open the briefing" etc.
// CTA verb for analytics is locked: "Open the briefing" (BRAND.md).
const PRODUCTS_AUTHED: {
  slug: ProductSlug;
  word: string;
  label: string;
  url: string;
}[] = [
  { slug: "tasks",     word: "tasks",     label: "Open the workspace",  url: `${TASKS_URL}/app` },
  { slug: "roadmap",   word: "roadmap",   label: "Open the roadmap",    url: `${ROADMAP_URL}/app` },
  { slug: "notes",     word: "notes",     label: "Open the notebook",   url: `${NOTES_URL}/app` },
  { slug: "analytics", word: "analytics", label: "Open the briefing",   url: `${ANALYTICS_URL}/app` },
];

const INDIGO = "#4f46e5";

const PRODUCT_ORIGINS = [TASKS_URL, ROADMAP_URL, NOTES_URL, ANALYTICS_URL];

/**
 * Warm a sibling product on hover/focus. Cross-origin prefetch warms
 * DNS/TLS + the document.
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
 * Dot-morph suite jump. The indigo dot blooms over a paper field, then we
 * navigate same-tab — the suite feels like one surface re-skinning.
 * Reduced-motion + modifier clicks skip this. ~380ms then location.href.
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
 * Auth-aware suite launcher.
 *
 * Authed mode (§14 L3):
 *   - Trigger label: "Products"
 *   - Each item deep-links to the product's APP entry (not marketing homepage)
 *   - App-context labels: "Open the workspace", "Open the briefing", etc.
 *   - Current product shown with active state, still tappable
 *   - "Back to Signal Studio" footer → signalstudio.ie (authed → suite launcher)
 *   - NO marketing taglines; NO "Sign in" / "Start for free" anywhere
 *
 * Unauthed mode:
 *   - Existing marketing behavior: taglines, marketing homepages
 *   - "Visit signalstudio.ie →" footer
 *
 * This component is used in both the marketing SiteNav (public routes) and
 * the /app chrome. The isAuthed prop switches between modes.
 */
export function SuiteLauncherAuthAware({
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

  // Phase 3 (instant-jump): on open, preconnect every sibling origin.
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    for (const origin of PRODUCT_ORIGINS) {
      if (document.head.querySelector(`link[data-suite-preconnect="${origin}"]`))
        continue;
      const l = document.createElement("link");
      l.rel = "preconnect";
      l.href = origin;
      l.crossOrigin = "";
      l.setAttribute("data-suite-preconnect", origin);
      document.head.appendChild(l);
    }
  }, [open]);

  const buttonLabel = isAuthed ? "Products" : "signal studio.";

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={isAuthed ? "Open product switcher" : "Open Signal Studio launcher"}
        style={{
          fontSize: 12,
          color: "var(--ink-quiet)",
          fontWeight: isAuthed ? 500 : 400,
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
        {isAuthed ? (
          <>
            {buttonLabel}
            <span style={{ color: INDIGO, marginLeft: 3 }}>▾</span>
          </>
        ) : (
          <>
            signal studio<span style={{ color: INDIGO }}>.</span>
          </>
        )}
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
          {/* Header row */}
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
              {isAuthed ? "Jump to a product." : "Four products, one studio."}
            </div>
          </div>

          {/* Product list */}
          <ul style={{ padding: 4, listStyle: "none", margin: 0 }}>
            {isAuthed
              ? PRODUCTS_AUTHED.map((p) => {
                  const isCurrent = p.slug === current;
                  return (
                    <li key={p.slug}>
                      <a
                        href={p.url}
                        onMouseEnter={(e) => {
                          prefetchProduct(p.url);
                          e.currentTarget.style.background =
                            "color-mix(in srgb, var(--ink) 5%, transparent)";
                        }}
                        onFocus={() => prefetchProduct(p.url)}
                        aria-current={isCurrent ? "true" : undefined}
                        role="menuitem"
                        onClick={(e) => {
                          setOpen(false);
                          if (
                            e.metaKey ||
                            e.ctrlKey ||
                            e.shiftKey ||
                            e.altKey ||
                            window.matchMedia("(prefers-reduced-motion: reduce)").matches
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
                          color: "var(--ink)",
                          background: isCurrent
                            ? "color-mix(in srgb, var(--ink) 4%, transparent)"
                            : "transparent",
                          transition: "background var(--motion-instant)",
                          fontWeight: isCurrent ? 600 : 400,
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrent) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: isCurrent ? 600 : 500,
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {p.word}
                            <span style={{ color: INDIGO }}>·</span>
                          </div>
                          {/* App-context label — NOT a marketing tagline */}
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 400,
                              color: "var(--ink-quiet)",
                            }}
                          >
                            {p.label}
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
                })
              : PRODUCTS_UNAUTHED.map((p) => {
                  const isCurrent = p.slug === current;
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
                        onFocus={isCurrent ? undefined : () => prefetchProduct(p.url)}
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
                            window.matchMedia("(prefers-reduced-motion: reduce)").matches
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
                          if (!isCurrent) e.currentTarget.style.background = "transparent";
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

          {/* Footer row */}
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
            {isAuthed ? "Back to Signal Studio →" : "Visit signalstudio.ie →"}
          </a>
        </div>
      ) : null}
    </div>
  );
}
