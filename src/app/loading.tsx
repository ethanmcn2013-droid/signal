/**
 * Analytics root /loading.tsx — wordmark identity loader.
 *
 * Mirrors /app/loading.tsx so cross-origin first-paint on ANY analytics
 * route shows the wordmark instead of a bare indigo dot.
 *
 * Server Component, zero JS, inlined keyframes.
 */
export default function RootLoading() {
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
            animation: `signal-dot-land 360ms cubic-bezier(0.34,1.56,0.64,1) ${word.length * 50 + 80}ms both, signal-dot-tick 3.6s steps(1,end) ${word.length * 50 + 600}ms infinite`,
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
        @keyframes signal-dot-tick {
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
          @keyframes signal-dot-tick {
            from, to { transform: translateY(-2px); }
          }
        }
      `}</style>
    </div>
  );
}
