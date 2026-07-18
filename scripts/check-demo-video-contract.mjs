#!/usr/bin/env node

/**
 * The public demo must open on a truthful, useful frame. The video begins with
 * an intentional two-second fade from black, so autoplaying it made initial
 * page renders and visual baselines look like an empty black rectangle.
 *
 * Keep a real frame from the film as the poster and let the visitor start the
 * film. This gives people, reduced-motion users, and automated captures the
 * same deterministic first impression.
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "src", "app", "(marketing)", "demo", "page.tsx");
const posterPath = path.join(root, "public", "demo-typography-poster.jpg");
const failures = [];

function jpegDimensions(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    if (segmentLength < 2) return null;
    offset += segmentLength + 2;
  }

  return null;
}

if (!existsSync(pagePath)) {
  failures.push("src/app/(marketing)/demo/page.tsx is missing");
} else {
  const source = readFileSync(pagePath, "utf8");
  if (!source.includes('poster="/demo-typography-poster.jpg"')) {
    failures.push("the demo video must use the real-frame poster");
  }
  if (!source.includes('preload="metadata"')) {
    failures.push("the demo video must preload metadata without replacing the poster");
  }
  if (source.includes("autoPlay")) {
    failures.push("the demo video must not autoplay past its deterministic poster");
  }
  if (!source.includes('aria-label="Play the Signal typography demo"')) {
    failures.push("the demo video must expose an accessible play label");
  }
}

if (!existsSync(posterPath)) {
  failures.push("public/demo-typography-poster.jpg is missing");
} else {
  const poster = readFileSync(posterPath);
  const dimensions = jpegDimensions(poster);
  if (!dimensions || dimensions.width !== 1920 || dimensions.height !== 1080) {
    failures.push(
      `the demo poster must be a 1920x1080 JPEG (received ${dimensions ? `${dimensions.width}x${dimensions.height}` : "an unreadable image"})`,
    );
  }
  if (statSync(posterPath).size < 20_000) {
    failures.push("the demo poster is unexpectedly small and may be blank or corrupt");
  }
}

if (failures.length > 0) {
  console.error("[demo-video-contract] FAIL");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("[demo-video-contract] ok (real 1920x1080 poster; autoplay disabled)");
