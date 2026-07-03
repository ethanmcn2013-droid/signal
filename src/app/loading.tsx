/**
 * Signal root loading boundary, Layer-0 Ready Dot.
 *
 * Loading canon (2026-07-01 review, pitch 1): the universal sub-300ms
 * fallback before chrome exists is a paper field with one static 10px
 * indigo dot. Quiet by design, if the app is fast, the brand does not
 * perform. No copy, no minimum hold, server-renderable, zero JS.
 *
 * This replaces the previous `analytics` wordmark loader: canon law 4
 * says visible loader names are notes, tasks, timeline, signal only —
 * `analytics` is an internal repo name and never appears in loading UI.
 * The destination wordmark moment lives at /app/loading.tsx (`signal`).
 *
 * Dot: 10px hard px (DESIGN.md §13.3). Static, §13.5: no animation in
 * loading.tsx itself; gesture animation belongs to the settled surface.
 * Reduced motion is satisfied without a media query.
 */
export default function RootLoading() {
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
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "var(--indigo, #4f46e5)",
          flexShrink: 0,
        }}
      />
    </div>
  );
}
