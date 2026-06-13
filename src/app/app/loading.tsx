/**
 * Analytics /app loading boundary — wordmark identity loader.
 *
 * Replaces the prior bare 10px indigo dot. Pure Server Component:
 * zero JS, inlined keyframes so motion paints with the first HTML
 * chunk — survives the brief cross-origin pre-CSS window during
 * sibling-product jumps.
 *
 * Choreography:
 *   1. Letters of "analytics" rise into place with stagger (50ms apart,
 *      280ms cubic-bezier(0.16,1,0.3,1)).
 *   2. Indigo dot lands as the period with a soft overshoot bounce
 *      after the last letter starts.
 *   3. Once landed, the dot enters the canonical Analytics tick —
 *      discrete Y samples, steps(1,end), 3.6s. Same gesture as the
 *      live product.
 *
 * Reduced motion: letters appear fully, dot lands without scale-bounce,
 * tick animation stops.
 */
export default function AnalyticsLoading() {
  const word = "signal";
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
      <span
        style={{
          fontFamily:
            'var(--font-geist-sans), "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          fontWeight: 600,
          fontSize: 36,
          letterSpacing: "-0.04em",
          lineHeight: 0.96,
          color: "var(--ink, #14151a)",
          display: "inline-flex",
          alignItems: "baseline",
          whiteSpace: "nowrap",
        }}
      >
        {word.split("").map((c, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              animation: `signal-letter-rise 280ms cubic-bezier(0.16,1,0.3,1) ${i * 50}ms both`,
            }}
          >
            {c}
          </span>
        ))}
        <span
          style={{
            display: "inline-block",
            width: 11,
            height: 11,
            maxWidth: 11,
            maxHeight: 11,
            borderRadius: "50%",
            background: "var(--indigo, #4f46e5)",
            marginLeft: 6,
            transform: "translateY(-2px)",
            flexShrink: 0,
            animation: `signal-dot-land 360ms cubic-bezier(0.34,1.56,0.64,1) ${word.length * 50 + 80}ms both, signal-analytics-tick 3.6s steps(1,end) ${word.length * 50 + 600}ms infinite`,
          }}
        />
      </span>
      <style>{`
        @keyframes signal-letter-rise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes signal-dot-land {
          0%   { opacity: 0; transform: translateY(-2px) scale(0.4); }
          60%  { opacity: 1; transform: translateY(-2px) scale(1.18); }
          100% { opacity: 1; transform: translateY(-2px) scale(1); }
        }
        @keyframes signal-analytics-tick {
          0%   { transform: translateY(-2px); }
          25%  { transform: translateY(-7px); }
          50%  { transform: translateY(1px); }
          75%  { transform: translateY(-5px); }
          100% { transform: translateY(-2px); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes signal-letter-rise {
            from { opacity: 1; transform: none; }
            to   { opacity: 1; transform: none; }
          }
          @keyframes signal-dot-land {
            from, to { opacity: 1; transform: translateY(-2px) scale(1); }
          }
          @keyframes signal-analytics-tick {
            from, to { transform: translateY(-2px); }
          }
        }
      `}</style>
    </div>
  );
}
