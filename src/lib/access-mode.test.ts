import assert from "node:assert/strict";
import test from "node:test";
import { getAccessMode } from "./access-mode";

const original = { node: process.env.NODE_ENV, vercel: process.env.VERCEL_ENV, mode: process.env.SIGNAL_ACCESS_MODE };

test.after(() => {
  const env = process.env as Record<string, string | undefined>;
  env.NODE_ENV = original.node;
  env.VERCEL_ENV = original.vercel;
  env.SIGNAL_ACCESS_MODE = original.mode;
});

test("production deployment cannot activate demo mode", () => {
  const env = process.env as Record<string, string | undefined>;
  env.NODE_ENV = "production";
  delete env.VERCEL_ENV;
  env.SIGNAL_ACCESS_MODE = "demo";
  assert.equal(getAccessMode(), "production");
});
