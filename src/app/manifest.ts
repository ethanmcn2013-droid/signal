import type { MetadataRoute } from "next";

/**
 * PWA manifest — Signal.
 *
 * Operational clarity. start_url goes to /app — the daily briefing
 * surface — because that's the value moment. Marketing home isn't
 * where an installed-app user wants to land.
 *
 * Not a dashboard. A briefing.
 *
 * Shortcut "Past briefings" points to /app/brief (the historical
 * briefing surface that actually exists in the codebase). The
 * earlier /app/history target was a 404 — fixed in this cycle.
 *
 * Maskable icon at /icon1 (512×512) for Android adaptive icons.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/signal",
    name: "Signal",
    short_name: "Signal",
    description:
      "Reads the state of your work and writes a short briefing. What needs you. What's moving. What's quiet.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "en-IE",
    dir: "ltr",
    categories: ["productivity", "business"],
    icons: [
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon1",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon1",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Past briefings",
        short_name: "Briefings",
        url: "/app/brief",
        description: "What you've seen.",
      },
    ],
  };
}
