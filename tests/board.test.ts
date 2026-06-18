import { describe, it, expect } from "vitest";
import { groupByStatus } from "@/lib/board";
import { ISSUES, STATUS_ORDER } from "@/fixtures/seed";

describe("groupByStatus", () => {
  it("returns the four columns in fixed order", () => {
    const cols = groupByStatus(ISSUES);
    expect(cols.map((c) => c.key)).toEqual(STATUS_ORDER);
  });

  it("partitions every issue into exactly one column", () => {
    const cols = groupByStatus(ISSUES);
    const total = cols.reduce((n, c) => n + c.count, 0);
    expect(total).toBe(ISSUES.length);
  });

  it("counts match the issues in each column", () => {
    for (const col of groupByStatus(ISSUES)) {
      expect(col.count).toBe(col.issues.length);
      expect(col.issues.every((i) => i.status === col.key)).toBe(true);
    }
  });

  it("handles an empty list", () => {
    const cols = groupByStatus([]);
    expect(cols).toHaveLength(4);
    expect(cols.every((c) => c.count === 0)).toBe(true);
  });
});
