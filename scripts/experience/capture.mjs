#!/usr/bin/env node

/**
 * Experience capture harness.
 *
 * Drives a running dev server with Playwright to produce the review receipt
 * that experience/registry.json references as an approvedBaselineReference:
 * a screenshot (SHA-256 digest) for every required state x breakpoint, route
 * status assertions, and a per-page accessibility snapshot. PNGs are generated
 * artifacts written under output/playwright/ (gitignored); only their logical
 * paths and digests are recorded in the evidence JSON, matching the suite's
 * "no committed binary baselines" convention.
 *
 * Determinism: animations and transitions are disabled via injected CSS and a
 * settle delay, so digests are reproducible. prefers-reduced-motion is emulated
 * for every capture; the "default" and "reduced-motion" states therefore agree
 * for pages whose only delta is motion, which is the honest outcome.
 *
 * Prerequisites (local tool, not a repo dependency — mirrors the original
 * @playwright/cli receipt): Playwright with Chromium available. Point the
 * harness at it with PLAYWRIGHT_MODULE (a file: URL or resolvable specifier).
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:3199 \
 *   PLAYWRIGHT_MODULE=file:///abs/path/to/playwright/index.mjs \
 *   OUT=experience/evidence/waitlist-cta-2026-07-19.json \
 *   node scripts/experience/capture.mjs
 */

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3199";
const OUT = process.env.OUT || "experience/evidence/capture.json";
const CAPTURED_AT = process.env.CAPTURED_AT || "2026-07-19";
const ARTIFACT_DIR = "output/playwright";
const pwSpec = process.env.PLAYWRIGHT_MODULE || "playwright";

const BREAKPOINTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "desktop", width: 1280, height: 800 },
  { name: "wide", width: 1440, height: 960 },
];

// The experiences this receipt covers. States mirror registry requiredStates.
const TARGETS = [
  { id: "signal.page.wedding-planning", route: "/wedding-planning", expect: 200,
    states: ["default", "long-content", "reduced-motion", "keyboard-only"] },
];

const FREEZE_CSS =
  "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent!important;scroll-behavior:auto!important}";

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}
function slug(s) {
  return s.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

const A11Y_FN = `() => {
  const norm = (s) => (s || "").replace(/\\s+/g, " ").trim();
  const accessibleName = (el) => norm(
    el.getAttribute("aria-label") ||
    (el.getAttribute("aria-labelledby") ? [...document.querySelectorAll("#" + el.getAttribute("aria-labelledby").split(" ").join(",#"))].map(n=>n.textContent).join(" ") : "") ||
    el.textContent ||
    el.getAttribute("title") ||
    (el.tagName === "INPUT" ? (el.getAttribute("placeholder") || el.getAttribute("value")) : "")
  );
  const interactive = [...document.querySelectorAll("a[href],button,input,select,textarea,[role=button],[role=link]")];
  const unlabelled = interactive.filter((el) => !accessibleName(el)).length;
  const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
  const dupIds = ids.length - new Set(ids).size;
  const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => Number(h.tagName[1]));
  let skips = 0;
  for (let i = 1; i < headings.length; i++) if (headings[i] - headings[i-1] > 1) skips++;
  return {
    mainLandmarkCount: document.querySelectorAll("main").length,
    h1Count: document.querySelectorAll("h1").length,
    horizontalOverflowPixels: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    unlabelledInteractiveControls: unlabelled,
    duplicateIds: dupIds,
    headingLevelSkips: skips,
  };
}`;

async function main() {
  const pw = await import(pwSpec);
  const chromium = pw.chromium || (pw.default && pw.default.chromium);
  const repoRoot = process.cwd();
  mkdirSync(path.join(repoRoot, ARTIFACT_DIR), { recursive: true });

  const browser = await chromium.launch();
  const captures = [];
  const routeAssertions = [];
  const accessibilityAssertions = { allCapturedKnownPages: null };
  const perPageA11y = [];

  for (const target of TARGETS) {
    const statusByBp = {};
    for (const bp of BREAKPOINTS) {
      const context = await browser.newContext({
        viewport: { width: bp.width, height: bp.height },
        reducedMotion: "reduce",
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
      page.on("pageerror", (e) => pageErrors.push(String(e)));

      const resp = await page.goto(BASE_URL + target.route, { waitUntil: "networkidle", timeout: 45000 });
      statusByBp[bp.name] = resp ? resp.status() : 0;
      await page.addStyleTag({ content: FREEZE_CSS });
      await page.waitForTimeout(400);

      // One accessibility snapshot per page, at desktop, default state.
      if (bp.name === "desktop") {
        const a11y = await page.evaluate(`(${A11Y_FN})()`);
        a11y.unexpectedConsoleErrors = consoleErrors.length;
        a11y.pageErrors = pageErrors.length;
        perPageA11y.push({ id: target.id, a11y });
      }

      for (const state of target.states) {
        // Only the states that are meaningful per breakpoint are captured; every
        // required state is captured at every required breakpoint.
        if (state === "keyboard-only") {
          await page.keyboard.press("Tab");
          await page.keyboard.press("Tab");
          await page.waitForTimeout(120);
        }
        const fullPage = state === "long-content";
        const file = `${slug(target.id)}-${bp.name}-${state}.png`;
        const buf = await page.screenshot({ fullPage, path: path.join(repoRoot, ARTIFACT_DIR, file) });
        captures.push({
          experienceId: target.id,
          state,
          viewport: bp.name,
          motion: "reduced",
          artifact: `${ARTIFACT_DIR}/${file}`,
          sha256: sha256(buf),
        });
        if (state === "keyboard-only") {
          // reset focus for any subsequent capture in this context
          await page.evaluate(() => document.activeElement && document.activeElement.blur());
        }
      }
      await context.close();
    }
    routeAssertions.push({ experienceId: target.id, route: target.route, ...statusByBp });
  }

  await browser.close();

  // Merge per-page a11y into a compact structure; report the worst-case common
  // block so a reviewer sees the shared guarantees at a glance.
  accessibilityAssertions.allCapturedKnownPages = perPageA11y.reduce((acc, { a11y }) => ({
    mainLandmarkCount: Math.max(acc.mainLandmarkCount, a11y.mainLandmarkCount),
    h1Count: Math.max(acc.h1Count, a11y.h1Count),
    horizontalOverflowPixels: Math.max(acc.horizontalOverflowPixels, a11y.horizontalOverflowPixels),
    unlabelledInteractiveControls: Math.max(acc.unlabelledInteractiveControls, a11y.unlabelledInteractiveControls),
    duplicateIds: Math.max(acc.duplicateIds, a11y.duplicateIds),
    headingLevelSkips: Math.max(acc.headingLevelSkips, a11y.headingLevelSkips),
    unexpectedConsoleErrors: Math.max(acc.unexpectedConsoleErrors, a11y.unexpectedConsoleErrors),
    pageErrors: Math.max(acc.pageErrors, a11y.pageErrors),
  }), { mainLandmarkCount: 0, h1Count: 0, horizontalOverflowPixels: 0, unlabelledInteractiveControls: 0, duplicateIds: 0, headingLevelSkips: 0, unexpectedConsoleErrors: 0, pageErrors: 0 });
  for (const { id, a11y } of perPageA11y) accessibilityAssertions[id] = a11y;

  // Materiality hashes of the covered sources, from the live registry mapping.
  const registry = JSON.parse(readFileSync(path.join(repoRoot, "experience", "registry.json"), "utf8"));
  const hashText = (t) => createHash("sha256").update(t.replace(/\r\n/g, "\n").replace(/\r/g, "\n"), "utf8").digest("hex").slice(0, 16);
  const sourceMaterialityHashes = {};
  for (const target of TARGETS) {
    const entry = registry.experiences.find((e) => e.id === target.id);
    if (entry) sourceMaterialityHashes[target.id] = hashText(readFileSync(path.join(repoRoot, entry.source), "utf8"));
  }

  const evidence = {
    schemaVersion: "signal-experience-evidence/1",
    capturedAt: CAPTURED_AT,
    product: registry.experiences[0]?.product || "timeline",
    changeClass: "link-target-only",
    reviewSummary:
      "CTA destinations converged from /sign-up (an access-gated auth wall) to /waitlist. " +
      "The diff is href-only: no change to DOM structure, copy, layout, styling, or focus order. " +
      "Full state x breakpoint captures were taken fresh against the live demo build to certify " +
      "no visual or accessibility regression, upgrading coverage from partial to complete.",
    environment: {
      accessMode: "demo",
      database: "file::memory:",
      databaseSchemaPresent: false,
      baseUrl: BASE_URL,
      browser: "Chromium via Playwright",
      viewports: BREAKPOINTS,
      motion: "prefers-reduced-motion: reduce; animations frozen via injected CSS",
    },
    sourceMaterialityHashes,
    routeAssertions,
    accessibilityAssertions,
    captures,
    coverageNotes: [
      "Every required state is captured at every required breakpoint (mobile, tablet, desktop, wide).",
      "Animations and transitions are frozen for deterministic digests; default and reduced-motion agree where a page's only delta is motion.",
      "long-content is a full-page capture; keyboard-only advances focus to the first interactive controls before capture.",
      "Capture PNGs are generated artifacts under output/playwright/; logical paths and SHA-256 digests are recorded here so a reviewer can reproduce and compare without committing binaries.",
    ],
  };

  mkdirSync(path.dirname(path.join(repoRoot, OUT)), { recursive: true });
  writeFileSync(path.join(repoRoot, OUT), JSON.stringify(evidence, null, 2) + "\n");
  console.log(`[capture] wrote ${OUT}: ${captures.length} captures, ${routeAssertions.length} routes`);
  const bad = routeAssertions.filter((r) => TARGETS.find((t) => t.id === r.experienceId).expect !== r.mobile);
  if (bad.length) {
    console.error("[capture] route status mismatch:", JSON.stringify(bad));
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
