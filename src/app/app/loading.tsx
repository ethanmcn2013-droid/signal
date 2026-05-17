/**
 * R3-mount · Authenticated app-segment loading boundary.
 *
 * Mirrors the root loading.tsx but scoped to /app/* routes. The
 * authenticated briefing shell can be slow on cold starts (Turso read
 * + Clerk session resolve). This boundary prevents a blank white flash.
 *
 * Gesture: Analytics tick (discrete jump, steps(1,end), 3.6s). Dot
 * is hard px so it cannot balloon from an unresolved font-size.
 */
export default function AppLoading() {
  return (
    <div
      role="status"
      aria-label="Loading briefing"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        minHeight: "40vh",
        background: "var(--bg)",
      }}
    >
      <span className="analytics-dot" aria-hidden="true" />
    </div>
  );
}
