// app/loading.tsx — Signal Analytics · root streaming boundary
// DESIGN.md §13 canonical zero-JS implementation.
// No "use client" — this is a Server Component with zero JS overhead.
// Paints with the RSC shell before any client JS executes.
//
// Accessibility: aria-hidden on the container — this is a visual
// transition aid, not meaningful content. The screen reader lands on
// the briefing <h1> when content streams in (DESIGN.md §13 rule 8).
//
// Reduced motion: no animation in this file — the static dot satisfies
// prefers-reduced-motion without a media query (DESIGN.md §13 rule 7).
//
// Dot ceiling: 10px hard-coded in px (not em) — immune to font-size
// inheritance before Geist Sans resolves (DESIGN.md §13 rule 3).

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
