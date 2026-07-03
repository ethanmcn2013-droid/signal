import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Signal, Operational clarity. Know what needs your attention.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#fafaf7",
          padding: "80px 96px",
          fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: 84,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            color: "#18181b",
            lineHeight: 0.96,
            marginBottom: 28,
          }}
        >
          Signal
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: "#3f3f46",
            lineHeight: 1.3,
          }}
        >
          What needs your attention.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 56,
            right: 96,
            fontSize: 18,
            fontFamily: "ui-monospace, monospace",
            color: "#71717a",
            letterSpacing: "0.04em",
          }}
        >
          signalstudio.ie
        </div>
      </div>
    ),
    { ...size }
  );
}
