import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
if (!/^drizzle-kit\s+migrate$/.test(String(pkg.scripts?.["db:migrate"] ?? ""))) {
  console.error("migration-contract: db:migrate must use drizzle-kit migrate");
  process.exit(1);
}
if (/drizzle-kit\s+push/.test(String(pkg.scripts?.dev ?? ""))) {
  console.error("migration-contract: dev must not run drizzle-kit push");
  process.exit(1);
}
console.log("migration-contract: ok");
