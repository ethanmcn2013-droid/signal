import assert from "node:assert/strict";
import test from "node:test";
import {
  authorizeSignalScope,
  selectAuthorizedScopeHint,
  type PlanningCatalog,
} from "./scope";

const catalog: PlanningCatalog = {
  planningSchemaAvailable: true,
  periods: [{
    id: "p1",
    name: "Wedding 2027",
    contextType: "wedding",
    startDate: null,
    endDate: "2027-08-14",
    timezone: "Europe/Dublin",
  }],
  workspaces: [{
    id: "w1",
    name: "Maeve and Dara",
    role: "member",
    planningPeriodId: "p1",
    contextType: "wedding",
    primaryDate: "2027-08-14",
    primaryDateLabel: "Wedding day",
  }],
};

test("cross-product hints never select a scope outside current membership", () => {
  assert.equal(selectAuthorizedScopeHint(catalog, "attacker", null), null);
  assert.deepEqual(selectAuthorizedScopeHint(catalog, "w1", null), {
    kind: "workspace",
    workspaceId: "w1",
  });
});

test("period scope unions only current active catalog workspaces", () => {
  const authorized = authorizeSignalScope(catalog, {
    kind: "planningPeriod",
    planningPeriodId: "p1",
  });
  assert.deepEqual(authorized?.workspaces.map((item) => item.id), ["w1"]);
  assert.equal(
    authorizeSignalScope(catalog, {
      kind: "planningPeriod",
      planningPeriodId: "attacker",
    }),
    null,
  );
});
