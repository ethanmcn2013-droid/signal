import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

export const EXPERIENCE_SCHEMA_VERSION = "signal-experience/1";
export const REQUIRED_BREAKPOINTS = ["mobile", "tablet", "desktop", "wide"];

const PAGE_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js"]);
const SPECIAL_FILES = new Map([
  ["page", "page"],
  ["loading", "loading"],
  ["error", "error"],
  ["not-found", "error"],
]);
const COVERAGE_VALUES = new Set(["none", "partial", "complete", "blocked"]);
const REVIEW_TIERS = new Set(["critical", "core", "supporting"]);

export function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

export function writeStableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function hashText(text) {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

function hashFile(file) {
  return hashText(readFileSync(file, "utf8"));
}

function walk(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const name of readdirSync(directory)) {
    const absolute = path.join(directory, name);
    const stat = statSync(absolute);
    if (stat.isDirectory()) {
      if (!["node_modules", ".next", ".git", "dist", "out", "coverage"].includes(name)) {
        files.push(...walk(absolute));
      }
    } else {
      files.push(absolute);
    }
  }
  return files;
}

function visibleRouteSegments(relativeDirectory) {
  if (!relativeDirectory || relativeDirectory === ".") return [];
  return relativeDirectory
    .split(path.sep)
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")))
    .filter((segment) => !segment.startsWith("@"));
}

export function normalizeRoute(appRoot, sourceFile) {
  const relativeDirectory = path.relative(appRoot, path.dirname(sourceFile));
  const segments = visibleRouteSegments(relativeDirectory);
  return segments.length ? `/${segments.join("/")}` : "/";
}

function kebab(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function slugSegment(segment) {
  const optionalCatchAll = segment.match(/^\[\[\.\.\.(.+)\]\]$/);
  if (optionalCatchAll) return `by-${kebab(optionalCatchAll[1])}`;
  const catchAll = segment.match(/^\[\.\.\.(.+)\]$/);
  if (catchAll) return `by-${kebab(catchAll[1])}`;
  const dynamic = segment.match(/^\[(.+)\]$/);
  if (dynamic) return `by-${kebab(dynamic[1])}`;
  return kebab(segment);
}

function routeSlug(route) {
  if (route === "/") return "root";
  return route.split("/").filter(Boolean).map(slugSegment).join("-");
}

function labelFromRoute(route) {
  if (route === "/") return "home";
  return route
    .split("/")
    .filter(Boolean)
    .map((segment) => (segment.startsWith("[") ? "selected record" : segment.replaceAll("-", " ")))
    .join(" \u00b7 ");
}

function isPublicRoute(route) {
  return !(route === "/app" || route.startsWith("/app/") || route.startsWith("/settings"));
}

function classifyArchetype(route, surfaceType) {
  if (["loading", "error", "empty", "success", "restricted", "notification"].includes(surfaceType)) {
    return "feedback-interruption-and-exception";
  }
  if (/sign-in|sign-up|welcome|onboarding|invite|redeem/.test(route)) {
    return "onboarding-and-authentication";
  }
  if (/settings|account|entitlements|access/.test(route)) {
    return "settings-and-administration";
  }
  if (/review|lab|loading-review/.test(route)) return "review-and-approval-workspace";
  if (/command|search|palette/.test(route)) return "search-and-command-interface";
  if (/board|plan\//.test(route)) return "editor-or-canvas";
  if (/list|reporting|waitlist/.test(route)) return "list-and-data-table";
  if (/contact|import|create|edit|plan\//.test(route)) return "create-and-edit-form";
  if (route === "/app" || /inbox|my-tasks|brief$/.test(route)) {
    return "dashboard-or-command-centre";
  }
  if (isPublicRoute(route) && !route.includes("[")) return "public-information-and-proof";
  return "detail-or-record-view";
}

function defaultStates(archetype, surfaceType) {
  if (surfaceType === "loading") return ["loading", "slow-loading", "reduced-motion"];
  if (surfaceType === "error") return ["error", "keyboard-only"];
  if (archetype === "onboarding-and-authentication") {
    return ["default", "loading", "error", "success", "disabled", "keyboard-only"];
  }
  if (["create-and-edit-form", "editor-or-canvas"].includes(archetype)) {
    return [
      "default",
      "loading",
      "error",
      "success",
      "disabled",
      "saved",
      "unsaved",
      "long-content",
      "reduced-motion",
      "keyboard-only",
    ];
  }
  if (["dashboard-or-command-centre", "list-and-data-table"].includes(archetype)) {
    return [
      "first-use",
      "empty",
      "populated",
      "loading",
      "partial-failure",
      "error",
      "restricted",
      "dense",
      "long-content",
      "reduced-motion",
      "keyboard-only",
    ];
  }
  if (archetype === "feedback-interruption-and-exception") {
    return ["default", "error", "success", "restricted", "reduced-motion", "keyboard-only"];
  }
  return ["default", "long-content", "reduced-motion", "keyboard-only"];
}

function defaultRoles(route) {
  if (route.startsWith("/app") || route.startsWith("/settings")) return ["owner", "member"];
  if (/share|embed|\/u\/|wedding-planning/.test(route)) return ["owner", "guest", "viewer"];
  return ["public"];
}

function defaultReviewTier(route, archetype) {
  if (route === "/" || route === "/app" || /sign-in|sign-up|privacy|terms|security/.test(route)) {
    return "critical";
  }
  if (["dashboard-or-command-centre", "create-and-edit-form", "editor-or-canvas"].includes(archetype)) {
    return "core";
  }
  return "supporting";
}

function parentJourney(route) {
  if (route === "/") return "suite-discovery";
  const first = route.split("/").filter(Boolean)[0] ?? "suite-discovery";
  if (first === "app" || first === "settings") return "signed-in-work";
  if (["sign-in", "sign-up", "welcome", "onboarding", "invite", "redeem"].includes(first)) {
    return "access-and-onboarding";
  }
  return "public-discovery-and-proof";
}

function baseEntry({ surfaceType, route, trigger, source, sourceFile, overrides = {} }) {
  const archetype = overrides.archetype ?? classifyArchetype(route ?? trigger ?? "/", surfaceType);
  const label = labelFromRoute(route ?? trigger ?? source);
  return {
    id: overrides.id,
    product: "signal",
    surfaceType,
    ...(route ? { route } : {}),
    ...(trigger ? { trigger } : {}),
    source,
    parentJourney: overrides.parentJourney ?? parentJourney(route ?? "/"),
    archetype,
    primaryJob: overrides.primaryJob ?? `Understand and use ${label}.`,
    primaryAction: overrides.primaryAction ?? `Complete the primary action on ${label}.`,
    roles: overrides.roles ?? defaultRoles(route ?? "/"),
    requiredStates: overrides.requiredStates ?? defaultStates(archetype, surfaceType),
    requiredBreakpoints: overrides.requiredBreakpoints ?? REQUIRED_BREAKPOINTS,
    componentDependencies: overrides.componentDependencies ?? [],
    patternDependencies: overrides.patternDependencies ?? [],
    reviewTier: overrides.reviewTier ?? defaultReviewTier(route ?? "/", archetype),
    designOwner: overrides.designOwner ?? "product-taste-design-integrity",
    engineeringOwner: overrides.engineeringOwner ?? "engineering-systems-architecture",
    implementationStatus: overrides.implementationStatus ?? "legacy",
    auditStatus: overrides.auditStatus ?? "registered",
    auditScore: overrides.auditScore ?? null,
    openFindingIds: overrides.openFindingIds ?? [],
    automatedTestCoverage: overrides.automatedTestCoverage ?? "none",
    screenshotCoverage: overrides.screenshotCoverage ?? "none",
    accessibilityCoverage: overrides.accessibilityCoverage ?? "none",
    fixtureCoverage: overrides.fixtureCoverage ?? "none",
    lastReviewedAt: overrides.lastReviewedAt ?? null,
    approvedBaselineReference: overrides.approvedBaselineReference ?? null,
    intentionalExceptions: overrides.intentionalExceptions ?? [],
    materialityHash: sourceFile && existsSync(sourceFile)
      ? hashFile(sourceFile)
      : hashText(JSON.stringify(overrides)),
  };
}

function sourceRelative(repoRoot, sourceFile) {
  return path.relative(repoRoot, sourceFile).split(path.sep).join("/");
}

function discoverRouteEntries(repoRoot, registered) {
  const appRoot = path.join(repoRoot, "src", "app");
  if (!existsSync(appRoot)) return [];
  const registeredBySource = new Map(
    registered.experiences
      .filter((entry) => entry.route)
      .map((entry) => [`${entry.source}|${entry.surfaceType}`, entry]),
  );
  const entries = [];
  for (const file of walk(appRoot)) {
    const extension = path.extname(file);
    if (!PAGE_EXTENSIONS.has(extension)) continue;
    const basename = path.basename(file, extension);
    if (!SPECIAL_FILES.has(basename)) continue;
    const route = normalizeRoute(appRoot, file);
    const surfaceType = SPECIAL_FILES.get(basename);
    const kind = basename === "page" ? "page" : "state";
    const suffix = basename === "page" ? routeSlug(route) : `${routeSlug(route)}-${basename}`;
    const source = sourceRelative(repoRoot, file);
    const previous = registeredBySource.get(`${source}|${surfaceType}`);
    const routingContext = path
      .relative(appRoot, path.dirname(file))
      .split(path.sep)
      .filter((segment) =>
        (segment.startsWith("(") && segment.endsWith(")")) || segment.startsWith("@"),
      )
      .map((segment) => kebab(segment.replace(/^[@(]+|[)]+$/g, "")))
      .filter(Boolean)
      .join("-");
    entries.push(
      baseEntry({
        surfaceType,
        route,
        source,
        sourceFile: file,
        overrides: {
          ...previous,
          id: previous?.id ?? `signal.${kind}.${suffix}`,
          discoveryContext: routingContext || "default",
        },
      }),
    );
  }

  const idCounts = new Map();
  for (const entry of entries) idCounts.set(entry.id, (idCounts.get(entry.id) ?? 0) + 1);
  for (const entry of entries) {
    if ((idCounts.get(entry.id) ?? 0) > 1) {
      const file = path.join(repoRoot, entry.source);
      const relativeDirectory = path.relative(appRoot, path.dirname(file));
      const context = relativeDirectory
        .split(path.sep)
        .filter((segment) =>
          (segment.startsWith("(") && segment.endsWith(")")) || segment.startsWith("@"),
        )
        .map((segment) => kebab(segment.replace(/^[@(]+|[)]+$/g, "")))
        .filter(Boolean)
        .join("-") || "default";
      entry.id = `${entry.id}-${context}`;
    }
  }
  return entries.sort((a, b) => a.id.localeCompare(b.id));
}

function discoverExplicitEntries(repoRoot, registered) {
  return registered.experiences
    .filter((entry) => entry.trigger)
    .map((entry) => {
      const sourceFile = path.join(repoRoot, entry.source.replaceAll("/", path.sep));
      return baseEntry({
        surfaceType: entry.surfaceType,
        route: entry.route,
        trigger: entry.trigger,
        source: entry.source,
        sourceFile,
        overrides: entry,
      });
    });
}

export function discoverRegistry({ repoRoot, registered }) {
  const experiences = [
    ...discoverRouteEntries(repoRoot, registered),
    ...discoverExplicitEntries(repoRoot, registered),
  ].sort((a, b) => a.id.localeCompare(b.id));
  return {
    schemaVersion: EXPERIENCE_SCHEMA_VERSION,
    generatedAt: new Date().toISOString().slice(0, 10),
    breakpoints: registered.breakpoints,
    experiences,
  };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateRegistry({ registry, discovered, repoRoot }) {
  const errors = [];
  const ids = new Set();
  const sourceKeys = new Set();
  const today = new Date().toISOString().slice(0, 10);
  const required = [
    "id",
    "product",
    "surfaceType",
    "source",
    "parentJourney",
    "archetype",
    "primaryJob",
    "primaryAction",
    "reviewTier",
    "designOwner",
    "engineeringOwner",
    "implementationStatus",
    "auditStatus",
    "materialityHash",
  ];

  if (registry.schemaVersion !== EXPERIENCE_SCHEMA_VERSION) {
    errors.push(`registry schema must be ${EXPERIENCE_SCHEMA_VERSION}`);
  }
  for (const breakpoint of REQUIRED_BREAKPOINTS) {
    const dimensions = registry.breakpoints?.[breakpoint];
    if (!dimensions || !Number.isInteger(dimensions.width) || !Number.isInteger(dimensions.height)) {
      errors.push(`registry breakpoint ${breakpoint} is missing valid dimensions`);
    }
  }

  for (const entry of registry.experiences ?? []) {
    for (const field of required) {
      if (!isNonEmptyString(entry[field])) errors.push(`${entry.id || "<missing-id>"}: missing ${field}`);
    }
    if (entry.product !== "signal") errors.push(`${entry.id}: product must be signal`);
    if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(entry.id)) errors.push(`${entry.id}: unstable ID format`);
    if (ids.has(entry.id)) errors.push(`${entry.id}: duplicate experience ID`);
    ids.add(entry.id);
    const sourceKey = `${entry.product}|${entry.source}|${entry.surfaceType}`;
    if (sourceKeys.has(sourceKey)) errors.push(`${entry.id}: duplicate registered source ${entry.source}`);
    sourceKeys.add(sourceKey);
    if (!entry.route && !entry.trigger) errors.push(`${entry.id}: route or trigger is required`);
    if (!Array.isArray(entry.roles) || !entry.roles.length) errors.push(`${entry.id}: roles are required`);
    if (!Array.isArray(entry.requiredStates) || !entry.requiredStates.length) {
      errors.push(`${entry.id}: required states are missing`);
    }
    if (!Array.isArray(entry.requiredBreakpoints) || !entry.requiredBreakpoints.length) {
      errors.push(`${entry.id}: required breakpoints are missing`);
    }
    for (const breakpoint of REQUIRED_BREAKPOINTS) {
      if (!entry.requiredBreakpoints?.includes(breakpoint)) {
        errors.push(`${entry.id}: missing breakpoint ${breakpoint}`);
      }
    }
    if (!REVIEW_TIERS.has(entry.reviewTier)) errors.push(`${entry.id}: invalid review tier`);
    for (const field of [
      "automatedTestCoverage",
      "screenshotCoverage",
      "accessibilityCoverage",
      "fixtureCoverage",
    ]) {
      if (!COVERAGE_VALUES.has(entry[field])) errors.push(`${entry.id}: invalid ${field}`);
    }
    if (entry.auditScore !== null &&
      (!Number.isFinite(entry.auditScore) || entry.auditScore < 0 || entry.auditScore > 4)) {
      errors.push(`${entry.id}: audit score must be null or between 0 and 4`);
    }
    if (!Array.isArray(entry.openFindingIds)) errors.push(`${entry.id}: openFindingIds must be an array`);
    for (const exception of entry.intentionalExceptions ?? []) {
      for (const field of [
        "id",
        "rationale",
        "owner",
        "scope",
        "approvalSource",
        "expiresAt",
        "remediationPlan",
      ]) {
        if (!isNonEmptyString(exception[field])) errors.push(`${entry.id}: exception missing ${field}`);
      }
      if (!exception.expiresAt || exception.expiresAt < today) {
        errors.push(`${entry.id}: expired exception ${exception.id}`);
      }
    }
  }

  const registeredById = new Map(registry.experiences.map((entry) => [entry.id, entry]));
  const discoveredById = new Map(discovered.experiences.map((entry) => [entry.id, entry]));
  for (const [id, entry] of discoveredById) {
    const registered = registeredById.get(id);
    if (!registered) {
      errors.push(`${id}: discovered experience is not registered (${entry.source})`);
      continue;
    }
    if (registered.source !== entry.source) {
      errors.push(`${id}: obsolete source reference ${registered.source}`);
    }
    if (registered.materialityHash !== entry.materialityHash) {
      const complete = [
        registered.fixtureCoverage,
        registered.screenshotCoverage,
        registered.accessibilityCoverage,
      ].every((coverage) => coverage === "complete");
      if (!complete) {
        errors.push(`${id}: changed experience lacks complete fixture, screenshot, and accessibility coverage`);
      }
    }
  }
  for (const [id, entry] of registeredById) {
    if (!discoveredById.has(id)) errors.push(`${id}: registered experience is obsolete (${entry.source})`);
    const absolute = path.join(repoRoot, entry.source.replaceAll("/", path.sep));
    if (!existsSync(absolute)) errors.push(`${id}: broken source reference ${entry.source}`);
  }
  return errors;
}

export function registryMetrics(registry) {
  const experiences = registry.experiences;
  const countComplete = (field) => experiences.filter((entry) => entry[field] === "complete").length;
  return {
    experiences: experiences.length,
    stateVariants: experiences.reduce((sum, entry) => sum + entry.requiredStates.length, 0),
    breakpointVariants: experiences.reduce((sum, entry) => sum + entry.requiredBreakpoints.length, 0),
    archetypes: Object.fromEntries(
      [...new Set(experiences.map((entry) => entry.archetype))]
        .sort()
        .map((archetype) => [
          archetype,
          experiences.filter((entry) => entry.archetype === archetype).length,
        ]),
    ),
    fixtureCoverage: countComplete("fixtureCoverage"),
    screenshotCoverage: countComplete("screenshotCoverage"),
    accessibilityCoverage: countComplete("accessibilityCoverage"),
    passing: experiences.filter((entry) => entry.auditStatus === "passing").length,
    underRemediation: experiences.filter((entry) => entry.auditStatus === "under-remediation").length,
  };
}
