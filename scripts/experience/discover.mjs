#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import path from "node:path";
import { discoverRegistry, readJson, registryMetrics, writeStableJson } from "./lib.mjs";

const repoRoot = process.cwd();
const registryFile = path.join(repoRoot, "experience", "registry.json");
const registered = readJson(registryFile);
const discovered = discoverRegistry({ repoRoot, registered });

if (process.argv.includes("--write")) {
  writeFileSync(registryFile, writeStableJson(discovered));
}

console.log(JSON.stringify(registryMetrics(discovered), null, 2));
