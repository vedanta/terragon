import { describe, it, expect } from "vitest";
import {
  fromFixtureIssue,
  fromResolvedIssue,
  groupBoardIssues,
  relativeTime,
  type BoardIssue,
} from "@/lib/view/board-issue";
import { ISSUES } from "@/fixtures/seed";
import type { ResolvedIssue } from "@/lib/board/service";

describe("board-issue adapters", () => {
  it("fromFixtureIssue resolves PEOPLE/LABELS keys to objects", () => {
    const i = ISSUES.find((x) => x.assignee && x.labels.length)!;
    const vm = fromFixtureIssue(i);
    expect(vm.assignee).toMatchObject({ name: expect.any(String) });
    expect(vm.labels[0]).toMatchObject({
      name: expect.any(String),
      color: expect.any(String),
    });
  });

  it("fromResolvedIssue derives assignee + label presentation", () => {
    const resolved: ResolvedIssue = {
      number: 42,
      title: "Live one",
      body: "b",
      state: "open",
      url: "https://github.com/a/b/issues/42",
      updatedAt: "2026-01-01T00:00:00Z",
      labels: ["backend"],
      assignees: [{ login: "octocat", name: "The Octocat", avatarUrl: "x" }],
      milestone: "v1",
      status: "in-progress",
    };
    const vm = fromResolvedIssue(resolved);
    expect(vm.assignee).toMatchObject({ name: "The Octocat", initials: "TO" });
    expect(vm.labels).toEqual([{ name: "backend", color: expect.any(String) }]);
    expect(vm.url).toBe(resolved.url);
  });

  it("both adapters yield the same shape", () => {
    const a = Object.keys(fromFixtureIssue(ISSUES[0])).sort();
    const b = Object.keys(
      fromResolvedIssue({
        number: 1,
        title: "t",
        body: "",
        state: "open",
        url: "u",
        updatedAt: "2026-01-01T00:00:00Z",
        labels: [],
        assignees: [],
        milestone: null,
        status: "planned",
      }),
    ).sort();
    expect(a).toEqual(b);
  });

  it("groupBoardIssues buckets by status in fixed order", () => {
    const vms: BoardIssue[] = ISSUES.map(fromFixtureIssue);
    const cols = groupBoardIssues(vms);
    expect(cols.map((c) => c.key)).toEqual([
      "planned",
      "in-progress",
      "done",
      "backburner",
    ]);
    expect(cols.reduce((n, c) => n + c.count, 0)).toBe(vms.length);
  });

  it("relativeTime handles invalid input gracefully", () => {
    expect(relativeTime("not-a-date")).toBe("not-a-date");
  });
});
