/**
 * R3-mount · Root loading boundary for Signal Analytics.
 *
 * App Router shows this file while any page in the root segment is
 * streaming. Renders Analytics' canonical tick gesture — the dot jumps
 * between discrete sample positions (steps(1,end), 3.6s) — centered on
 * the paper background. The dot is sized in hard px (never em) so it
 * cannot inherit an unresolved font-size and balloon pre-hydration.
 *
 * DESIGN.md §5: Analytics gesture = tick (discrete jump, never glide).
 * DESIGN.md §10: Skeleton loaders > 200ms are banned — this is a genuine
 * boundary, not a spinner on a fast action.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        background: "var(--bg)",
      }}
    >
      {/* The analytics-dot keyframe is defined in globals.css and
          implements the tick gesture (steps(1,end), 3.6s). Width/height
          are hard px; max-width/max-height are the balloon guard. */}
      <span className="analytics-dot" aria-hidden="true" />
    </div>
  );
}
