import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildSuiteProductHref,
  normalizeSuiteContextForSignal,
  readSuiteNavigationContext,
} from "./suite-context";
import suiteContracts from "./suite-contracts.v1.json";

describe("suite navigation context", () => {
  it("keeps the emitted query names in the version-one data contract", () => {
    assert.deepEqual(suiteContracts.context.transport, {
      encoding: "url-query",
      parameters: [
        "sourceProduct",
        "workspaceId",
        "projectId",
        "objectRef",
        "returnUrl",
      ],
      returnUrlPolicy: "signal-studio-or-local-review-origin",
    });
  });

  it("carries Signal workspace and project scope into a sibling product", () => {
    const location = new URL(
      "https://signal.signalstudio.ie/app/trends?scope_type=project&scope_id=launch&workspace_id=ws-1&period=twelve_weeks",
    );

    const context = readSuiteNavigationContext(location, "signal");
    const destination = new URL(
      buildSuiteProductHref("https://tasks.signalstudio.ie/app", context),
    );

    assert.equal(destination.pathname, "/app");
    assert.equal(destination.searchParams.get("sourceProduct"), "signal");
    assert.equal(destination.searchParams.get("workspaceId"), "ws-1");
    assert.equal(destination.searchParams.get("projectId"), "launch");
    assert.equal(destination.searchParams.get("returnUrl"), location.toString());
  });

  it("accepts canonical context keys used by sibling products", () => {
    const context = readSuiteNavigationContext(
      new URL(
        "https://tasks.signalstudio.ie/app?workspaceId=ws-shared&projectId=venue",
      ),
      "tasks",
    );

    assert.deepEqual(context, {
      sourceProduct: "tasks",
      workspaceId: "ws-shared",
      projectId: "venue",
      returnUrl:
        "https://tasks.signalstudio.ie/app?workspaceId=ws-shared&projectId=venue",
    });
  });

  it("carries planning-period context through sibling product links", () => {
    const location = new URL(
      "https://signal.signalstudio.ie/app?contextVersion=2&planningPeriodId=season-2026",
    );
    const destination = new URL(
      buildSuiteProductHref(
        "https://tasks.signalstudio.ie/app",
        readSuiteNavigationContext(location, "signal"),
      ),
    );

    assert.equal(destination.searchParams.get("contextVersion"), "2");
    assert.equal(destination.searchParams.get("planningPeriodId"), "season-2026");
    assert.equal(destination.searchParams.get("sourceProduct"), "signal");
  });

  it("replaces inbound transport metadata instead of nesting return URLs", () => {
    const location = new URL(
      "https://signal.signalstudio.ie/app?workspace_id=ws-1&sourceProduct=tasks&workspaceId=old&returnUrl=https%3A%2F%2Ftasks.signalstudio.ie%2Fapp",
    );

    const context = readSuiteNavigationContext(location, "signal");
    const returnUrl = new URL(context.returnUrl!);

    assert.equal(context.workspaceId, "ws-1");
    assert.equal(returnUrl.searchParams.get("workspace_id"), "ws-1");
    assert.equal(returnUrl.searchParams.has("sourceProduct"), false);
    assert.equal(returnUrl.searchParams.get("workspaceId"), "old");
    assert.equal(returnUrl.searchParams.has("returnUrl"), false);
  });

  it("drops malformed, oversized, and non-http context values", () => {
    const longId = "x".repeat(201);
    const location = new URL(
      `file:///app?workspaceId=${longId}&projectId=%0Aunsafe`,
    );

    assert.deepEqual(readSuiteNavigationContext(location, "signal"), {
      sourceProduct: "signal",
    });
  });

  it("normalizes canonical context for Signal without overriding native state", () => {
    const incoming = normalizeSuiteContextForSignal(
      new URLSearchParams({
        sourceProduct: "tasks",
        workspaceId: "ws-shared",
        projectId: "venue",
      }),
    );
    assert.equal(incoming.get("workspace_id"), "ws-shared");
    assert.equal(incoming.get("scope_type"), "project");
    assert.equal(incoming.get("scope_id"), "venue");

    const native = normalizeSuiteContextForSignal(
      new URLSearchParams({
        sourceProduct: "tasks",
        workspaceId: "ignored",
        projectId: "ignored",
        workspace_id: "ws-native",
        scope_type: "workspace",
        scope_id: "ws-native",
      }),
    );
    assert.equal(native.get("workspace_id"), "ws-native");
    assert.equal(native.get("scope_type"), "workspace");
    assert.equal(native.get("scope_id"), "ws-native");
  });

  it("does not emit an off-suite return URL", () => {
    const context = readSuiteNavigationContext(
      new URL("https://attacker.example/app?workspaceId=ws-1"),
      "tasks",
    );
    assert.equal(context.returnUrl, undefined);

    const destination = new URL(
      buildSuiteProductHref("https://signal.signalstudio.ie/app", {
        ...context,
        returnUrl: "https://attacker.example/redirect",
      }),
    );
    assert.equal(destination.searchParams.has("returnUrl"), false);
  });
});
