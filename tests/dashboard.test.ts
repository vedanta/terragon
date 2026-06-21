import { describe, it, expect } from "vitest";
import { dashboardStats, statusDistribution } from "@/lib/view/dashboard";
import { fromFixtureIssue } from "@/lib/view/board-issue";
import { ISSUES } from "@/fixtures/seed";

const vms = ISSUES.map(fromFixtureIssue);

describe("dashboardStats", () => {
  it("counts by status with open = total - done", () => {
    const s = dashboardStats(vms);
    expect(s.total).toBe(vms.length);
    expect(s.open).toBe(s.total - s.done);
    expect(s.inProgress).toBe(
      vms.filter((i) => i.status === "in-progress").length,
    );
    expect(s.unassigned).toBe(vms.filter((i) => !i.assignee).length);
  });

  it("handles an empty board", () => {
    const s = dashboardStats([]);
    expect(s).toMatchObject({ total: 0, open: 0, done: 0, unassigned: 0 });
  });
});

describe("statusDistribution", () => {
  it("returns the four statuses in fixed order, counts summing to total", () => {
    const d = statusDistribution(vms);
    expect(d.map((s) => s.key)).toEqual([
      "planned",
      "in-progress",
      "done",
      "backburner",
    ]);
    expect(d.reduce((n, s) => n + s.count, 0)).toBe(vms.length);
  });

  it("does not divide by zero on an empty board", () => {
    const d = statusDistribution([]);
    expect(d.every((s) => s.pct === 0)).toBe(true);
  });
});
