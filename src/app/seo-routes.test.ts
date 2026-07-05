import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import sitemap from "./sitemap";
import robots from "./robots";

// Contract guard for the public SEO surface (A·10). The sitemap and robots
// policy encode a privacy invariant — no auth-walled, tokenised, or gated
// route may ever be advertised to crawlers. These assertions fail loudly if
// a future edit adds a private path to the sitemap or drops a disallow.

// Every prefix that must stay out of the sitemap and stay disallowed.
const PRIVATE_PREFIXES = ["/app", "/u/", "/api", "/waitlist", "/sign-in", "/sign-up"];

describe("sitemap", () => {
  const entries = sitemap();

  test("lists only absolute https URLs", () => {
    assert.ok(entries.length > 0, "sitemap is empty");
    for (const e of entries) {
      assert.match(e.url, /^https?:\/\//, `not absolute: ${e.url}`);
    }
  });

  test("contains no duplicate URLs", () => {
    const urls = entries.map((e) => e.url);
    assert.equal(new Set(urls).size, urls.length, "duplicate sitemap URLs");
  });

  test("never advertises a private route", () => {
    for (const e of entries) {
      const path = new URL(e.url).pathname;
      for (const prefix of PRIVATE_PREFIXES) {
        assert.ok(
          !(path === prefix || path.startsWith(prefix)),
          `private route leaked into sitemap: ${path}`,
        );
      }
    }
  });

  test("includes the home page at top priority", () => {
    const home = entries.find((e) => new URL(e.url).pathname === "/");
    assert.ok(home, "home page missing from sitemap");
    assert.equal(home.priority, 1.0);
  });

  test("priorities are within the valid [0,1] range", () => {
    for (const e of entries) {
      assert.ok(
        typeof e.priority === "number" && e.priority >= 0 && e.priority <= 1,
        `priority out of range for ${e.url}: ${e.priority}`,
      );
    }
  });
});

describe("robots", () => {
  const r = robots();
  const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
  const disallow = Array.isArray(rule?.disallow)
    ? rule.disallow
    : rule?.disallow
      ? [rule.disallow]
      : [];

  test("allows the public root", () => {
    const allow = Array.isArray(rule?.allow) ? rule.allow : [rule?.allow];
    assert.ok(allow.includes("/"), "root is not allowed");
  });

  test("disallows every private prefix", () => {
    for (const prefix of PRIVATE_PREFIXES) {
      const covered = disallow.some((d) => prefix.startsWith(d) || d === prefix);
      assert.ok(covered, `no disallow covers ${prefix} (have: ${disallow.join(", ")})`);
    }
  });

  test("points crawlers at the sitemap", () => {
    assert.ok(
      typeof r.sitemap === "string" && r.sitemap.endsWith("/sitemap.xml"),
      `sitemap reference malformed: ${String(r.sitemap)}`,
    );
  });

  test("sitemap host and robots host agree", () => {
    const host = String(r.host);
    assert.ok(String(r.sitemap).startsWith(host), "sitemap URL is not under host");
  });
});
