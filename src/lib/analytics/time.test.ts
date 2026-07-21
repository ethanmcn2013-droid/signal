import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import {
  dueExpiry,
  isInPeriod,
  localDateEndExclusive,
  localDateStart,
  parseInstant,
  previousEqualPeriods,
  resolvePeriod,
  validatePeriod,
} from "./time";

describe("analytics time boundaries", () => {
  test("rejects ambiguous date-only values as instants", () => {
    assert.throws(() => parseInstant("2026-07-13"), /ISO instant/);
  });

  test("treats period end as exclusive", () => {
    const period = {
      start: "2026-07-01T00:00:00.000Z",
      end: "2026-08-01T00:00:00.000Z",
      timezone: "UTC",
    };
    assert.equal(isInPeriod(Date.parse(period.start), period), true);
    assert.equal(isInPeriod(Date.parse(period.end), period), false);
  });

  test("date-only due values expire after the local day, including DST start", () => {
    const start = localDateStart("2026-03-29", "Europe/London");
    const end = localDateEndExclusive("2026-03-29", "Europe/London");
    assert.equal(new Date(start).toISOString(), "2026-03-29T00:00:00.000Z");
    assert.equal(new Date(end).toISOString(), "2026-03-29T23:00:00.000Z");
    assert.equal(end - start, 23 * 60 * 60 * 1000);
    assert.equal(
      dueExpiry({ kind: "date", value: "2026-03-29" }, "Europe/London"),
      end,
    );
  });

  test("rolling periods preserve local wall-clock time across DST", () => {
    const period = resolvePeriod(
      "four_weeks",
      "2026-10-26T10:00:00.000Z",
      "Europe/London",
    );
    // 10:00 London was 09:00Z before the October clock change.
    assert.equal(period.start, "2026-09-28T09:00:00.000Z");
    assert.equal(period.end, "2026-10-26T10:00:00.000Z");
  });

  test("comparison periods are three equal elapsed ranges", () => {
    const current = {
      start: "2026-06-15T09:00:00.000Z",
      end: "2026-07-13T09:00:00.000Z",
      timezone: "Europe/London",
    };
    const previous = previousEqualPeriods(current, 3);
    assert.deepEqual(previous.map((item) => [item.start, item.end]), [
      ["2026-05-18T09:00:00.000Z", "2026-06-15T09:00:00.000Z"],
      ["2026-04-20T09:00:00.000Z", "2026-05-18T09:00:00.000Z"],
      ["2026-03-23T09:00:00.000Z", "2026-04-20T09:00:00.000Z"],
    ]);
  });

  test("rejects inverted periods and invalid timezones", () => {
    assert.throws(
      () =>
        validatePeriod({
          start: "2026-07-13T09:00:00.000Z",
          end: "2026-07-01T09:00:00.000Z",
          timezone: "UTC",
        }),
      /after start/,
    );
    assert.throws(
      () =>
        validatePeriod({
          start: "2026-07-01T09:00:00.000Z",
          end: "2026-07-13T09:00:00.000Z",
          timezone: "Not\/A-Timezone",
        }),
      /Invalid timezone/,
    );
  });
});
