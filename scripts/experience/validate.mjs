#!/usr/bin/env node
import path from "node:path";
import { discoverRegistry, readJson, registryMetrics, validateRegistry } from "./lib.mjs";

const repoRoot = process.cwd();
const registryFile = path.join(repoRoot, "experience", "registry.json");
const registry = readJson(registryFile);
const discovered = discoverRegistry({ repoRoot, registered: registry });
const errors = validateRegistry({ registry, discovered, repoRoot });

if (errors.length) {
  console.error(
    `experience:validate: ${errors.length} failure(s)\n${errors.map((error) => `  x ${error}`).join("\n")}`,
  );
  process.exit(1);
}

console.log(`experience:validate: clean\n${JSON.stringify(registryMetrics(registry), null, 2)}`);
