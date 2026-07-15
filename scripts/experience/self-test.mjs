#!/usr/bin/env node
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { discoverRegistry, validateRegistry } from "./lib.mjs";

const breakpoints = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 900 },
  wide: { width: 1440, height: 960 },
};
const root = mkdtempSync(path.join(tmpdir(), "signal-experience-"));

try {
  const appRoot = path.join(root, "src", "app");
  mkdirSync(appRoot, { recursive: true });
  writeFileSync(path.join(appRoot, "page.tsx"), "export default function Page(){return null}\n");
  const seed = {
    schemaVersion: "signal-experience/1",
    generatedAt: "2026-07-15",
    breakpoints,
    experiences: [],
  };
  const registered = discoverRegistry({ repoRoot: root, registered: seed });
  registered.experiences[0].fixtureCoverage = "partial";
  registered.experiences[0].lastReviewedAt = "2026-07-15";
  const rediscovered = discoverRegistry({ repoRoot: root, registered });
  if (
    rediscovered.experiences[0].fixtureCoverage !== "partial" ||
    rediscovered.experiences[0].lastReviewedAt !== "2026-07-15"
  ) {
    throw new Error("self-test failed: route discovery discarded review metadata");
  }

  const missingRoot = path.join(appRoot, "unregistered");
  mkdirSync(missingRoot, { recursive: true });
  writeFileSync(path.join(missingRoot, "page.tsx"), "export default function Page(){return null}\n");
  const discovered = discoverRegistry({ repoRoot: root, registered });
  const errors = validateRegistry({ registry: registered, discovered, repoRoot: root });

  if (!errors.some((error) => error.includes("discovered experience is not registered"))) {
    throw new Error(`self-test failed: unregistered route was not caught\n${errors.join("\n")}`);
  }
  console.log("experience:self-test: pass - a deliberately unregistered route is rejected");
} finally {
  rmSync(root, { recursive: true, force: true });
}
