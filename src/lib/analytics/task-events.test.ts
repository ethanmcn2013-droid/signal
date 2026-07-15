import assert from "node:assert/strict";
import test from "node:test";
import { isTerminalTaskTransition } from "./task-events";

test("only canonical Tasks transitions into done count as completion", () => {
  assert.equal(isTerminalTaskTransition("toggleComplete", { to: "done" }), true);
  assert.equal(isTerminalTaskTransition("move", { to: "done" }), true);
  assert.equal(isTerminalTaskTransition("update", { to: "done" }), false);
  assert.equal(isTerminalTaskTransition("move", { to: "review" }), false);
});
