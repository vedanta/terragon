import { describe, it, expect } from "vitest";
import { sortBoardIssues, SORTS, DEFAULT_SORT } from "@/lib/view/board-sort";
import {
  fromFixtureIssue,
  fromResolvedIssue,
  parseRelativeSeconds,
  type BoardIssue,
} from "@/lib/view/board-issue";
import { ISSUES } from "@/fixtures/seed";
import type { ResolvedIssue } from "@/lib/board/service";

function vm(over: Partial<BoardIssue>): BoardIssue {
  return {
    number: 1,
    title: "x",
    status: "planned",
    assignee: null,
    assigneeLogin: null,
    labels: [],
    milestone: null,
    updated: "just now",
    updatedRank: 0,
    description: "",
    url: "",
    comments: [],
    activity: [],
    ...over,
  };
}

describe("parseRelativeSeconds", () => {
  it("maps relative strings to seconds-ago", () => {
    expect(parseRelativeSeconds("just now")).toBe(0);
    expect(parseRelativeSeconds("2h ago")).toBe(7200);
    expect(parseRelativeSeconds("3d ago")).toBe(259200);
    expect(parseRelativeSeconds("1mo ago")).toBe(2592000);
  });

  it("treats unparseable input as very old", () => {
    expect(parseRelativeSeconds("whenever")).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe("updatedRank adapters", () => {
  it("fixture rank is higher (newer) for more recent strings", () => {
    const recent = fromFixtureIssue({
      ...ISSUES[0],
      updated: "2h ago",
    });
    const old = fromFixtureIssue({ ...ISSUES[0], updated: "3d ago" });
    expect(recent.updatedRank).toBeGreaterThan(old.updatedRank);
  });

  it("live rank parses the ISO timestamp", () => {
    const base: ResolvedIssue = {
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
    };
    const newer = fromResolvedIssue({
      ...base,
      updatedAt: "2026-06-01T00:00:00Z",
    });
    const older = fromResolvedIssue(base);
    expect(newer.updatedRank).toBeGreaterThan(older.updatedRank);
  });
});

describe("sortBoardIssues", () => {
  const issues = [
    vm({ number: 3, title: "Banana", updatedRank: -100 }),
    vm({ number: 1, title: "apple", updatedRank: -10 }),
    vm({ number: 2, title: "Cherry", updatedRank: -50 }),
  ];

  it("by number is ascending", () => {
    expect(sortBoardIssues(issues, "number").map((i) => i.number)).toEqual([
      1, 2, 3,
    ]);
  });

  it("by title is case-insensitive A–Z", () => {
    expect(sortBoardIssues(issues, "title").map((i) => i.title)).toEqual([
      "apple",
      "Banana",
      "Cherry",
    ]);
  });

  it("by updated is newest first (highest rank)", () => {
    expect(sortBoardIssues(issues, "updated").map((i) => i.number)).toEqual([
      1, 2, 3,
    ]);
  });

  it("does not mutate the input", () => {
    const before = issues.map((i) => i.number);
    sortBoardIssues(issues, "number");
    expect(issues.map((i) => i.number)).toEqual(before);
  });

  it("default sort is a known key", () => {
    expect(SORTS.map((s) => s.key)).toContain(DEFAULT_SORT);
  });
});
