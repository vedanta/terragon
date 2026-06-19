import { describe, it, expect } from "vitest";
import { buildColumns } from "@/lib/board/service";
import type { RawIssue } from "@/lib/github/types";

function raw(
  number: number,
  state: "open" | "closed",
  labels: string[],
): RawIssue {
  return {
    number,
    title: `Issue ${number}`,
    body: "",
    state,
    url: `u/${number}`,
    updatedAt: "2026-01-01T00:00:00Z",
    labels,
    assignees: [],
    milestone: null,
  };
}

describe("buildColumns (board service integration)", () => {
  const issues: RawIssue[] = [
    raw(1, "open", ["terragon/planned"]),
    raw(2, "open", ["terragon/in-progress"]),
    raw(3, "closed", []), // → done via native state
    raw(4, "open", ["terragon/backburner"]),
    raw(5, "open", ["bug"]), // unlabeled → planned default
    raw(6, "open", ["terragon/planned", "terragon/in-progress"]), // conflict → in-progress
  ];

  it("returns the four columns in fixed order", () => {
    expect(buildColumns(issues).map((c) => c.key)).toEqual([
      "planned",
      "in-progress",
      "done",
      "backburner",
    ]);
  });

  it("resolves + groups every issue into exactly one column", () => {
    const cols = buildColumns(issues);
    const total = cols.reduce((n, c) => n + c.count, 0);
    expect(total).toBe(issues.length);
  });

  it("places issues in the expected columns", () => {
    const cols = buildColumns(issues);
    const by = (k: string) =>
      cols
        .find((c) => c.key === k)!
        .issues.map((i) => i.number)
        .sort();
    expect(by("planned")).toEqual([1, 5]);
    expect(by("in-progress")).toEqual([2, 6]);
    expect(by("done")).toEqual([3]);
    expect(by("backburner")).toEqual([4]);
  });
});
