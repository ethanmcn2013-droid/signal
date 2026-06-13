import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Signal — A briefing, not a dashboard. Know what needs your attention today.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "#fafaf7",
          padding: "72px 88px",
          fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
          position: "relative",
        }}
      >
        {/* Top row — wordmark + dot */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "#18181b",
            }}
          >
            signal
          </span>
          <span
            style={{
              display: "block",
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#4f46e5",
              marginLeft: 3,
              marginBottom: 10,
            }}
          />
        </div>

        {/* Centre content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Eyebrow */}
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#71717a",
              fontFamily: "ui-monospace, monospace",
            }}
          >
            Operational clarity
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 76,
              fontWeight: 600,
              letterSpacing: "-0.045em",
              color: "#18181b",
              lineHeight: 0.96,
              maxWidth: 860,
            }}
          >
            What needs your attention.
          </div>

          {/* Subline */}
          <div
            style={{
              fontSize: 26,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              color: "#3f3f46",
              lineHeight: 1.4,
              maxWidth: 620,
              marginTop: 8,
            }}
          >
            Not a dashboard. A briefing.
          </div>
        </div>

        {/* Bottom strip — domain attribution */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontFamily: "ui-monospace, monospace",
              color: "#a1a1aa",
              letterSpacing: "0.04em",
            }}
          >
            signalstudio.ie
          </span>
          {/* Indigo accent line at bottom-left */}
          <span
            style={{
              display: "block",
              width: 32,
              height: 3,
              borderRadius: 2,
              background: "#4f46e5",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
