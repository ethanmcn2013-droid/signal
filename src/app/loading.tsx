/**
 * Analytics root loading boundary — App Router loading.tsx
 *
 * Spec: LOADING_SYSTEM.md §1 (2026-05-18 seamless-wave, D8 remediation).
 * Supersedes: analytics-dot tick gesture with minHeight:50vh (banned by
 * LOADING_SYSTEM.md §4 — "position:fixed;inset:0 required; minHeight:50vh
 * means bottom half can flash grey while top half loads").
 *
 * Visual: one indigo dot. Paper-white field. No wordmark. No chrome.
 * No skeleton. Server Component: zero JS overhead, paints with RSC shell.
 *
 * The dot class `signal-loading-dot` is defined in globals.css:
 *   - @media no-preference: signal-load-pulse 1.8s infinite
 *   - @media reduce: animation:none; opacity:0.85 (static dot, brand present)
 *
 * LOADING_SYSTEM.md hard refusals (cite doc if asked to change):
 *   1. No wordmark in the loading state.
 *   2. No skeleton bars.
 *   3. No large disc, spinner, or ring.
 *   4. No product-colour differentiation.
 *   5. No text in the loading state.
 *   6. No top progress bar (creative-director refusal).
 */
export default function Loading() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--paper, #ffffff)",
        zIndex: 9999,
      }}
    >
      <div
        className="signal-loading-dot"
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "var(--indigo, #4f46e5)",
          flexShrink: 0,
          willChange: "transform, opacity",
        }}
      />
    </div>
  );
}
