import assert from "node:assert/strict";
import test from "node:test";
import { scrubEvent } from "./sentry-scrub";

test("Sentry removes bearer URLs, secret fields, and sensitive breadcrumbs", () => {
  const event = scrubEvent({
    request: { url: "https://signal.signalstudio.ie/u/private?code=private" },
    tags: { scopeKind: "workspace", shareToken: "private" },
    contexts: { source: { assertion: "private", workspaceCount: 2 } },
    breadcrumbs: [
      { data: { url: "https://signal.signalstudio.ie/api/unsubscribe/private" } },
      { data: { url: "https://signal.signalstudio.ie/app?safe=1&token=private" } },
    ],
  } as never)!;
  const serialized = JSON.stringify(event);
  assert.equal(serialized.includes("private"), false);
  assert.equal(event.breadcrumbs?.length, 1);
});
