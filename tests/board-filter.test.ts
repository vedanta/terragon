import { describe, it, expect } from "vitest";
import {
  applyBoardFilter,
  deriveFilterOptions,
  isFilterActive,
  EMPTY_FILTER,
  UNASSIGNED,
  NO_MILESTONE,
} from "@/lib/view/board-filter";
import { fromFixtureIssue, type BoardIssue } from "@/lib/view/board-issue";
import { ISSUES } from "@/fixtures/seed";

const vms: BoardIssue[] = ISSUES.map(fromFixtureIssue);

describe("board-filter options", () => {
  it("derives sorted assignee/label/milestone options from the issues", () => {
    const opts = deriveFilterOptions(vms);
    expect(opts.assignees.length).toBeGreaterThan(0);
    expect(opts.labels.length).toBeGreaterThan(0);
    expect(opts.milestones.length).toBeGreaterThan(0);

    const labels = opts.labels.map((o) => o.label);
    expect([...labels].sort((a, b) => a.localeCompare(b))).toEqual(labels);
  });

  it("appends Unassigned / No milestone buckets when present", () => {
    const opts = deriveFilterOptions(vms);
    expect(opts.assignees.some((o) => o.value === UNASSIGNED)).toBe(true);
    expect(opts.milestones.some((o) => o.value === NO_MILESTONE)).toBe(true);
  });

  it("omits the Unassigned bucket when every issue has an assignee", () => {
    const allAssigned = vms.filter((i) => i.assigneeLogin);
    const opts = deriveFilterOptions(allAssigned);
    expect(opts.assignees.some((o) => o.value === UNASSIGNED)).toBe(false);
  });
});

describe("applyBoardFilter", () => {
  it("returns everything when no filter is active", () => {
    expect(applyBoardFilter(vms, EMPTY_FILTER)).toHaveLength(vms.length);
  });

  it("filters by a specific assignee", () => {
    const login = vms.find((i) => i.assigneeLogin)!.assigneeLogin!;
    const out = applyBoardFilter(vms, { ...EMPTY_FILTER, assignee: login });
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((i) => i.assigneeLogin === login)).toBe(true);
  });

  it("filters to unassigned issues", () => {
    const out = applyBoardFilter(vms, { ...EMPTY_FILTER, assignee: UNASSIGNED });
    expect(out.every((i) => i.assigneeLogin === null)).toBe(true);
  });

  it("filters by label and milestone", () => {
    const label = vms.find((i) => i.labels.length)!.labels[0].name;
    const byLabel = applyBoardFilter(vms, { ...EMPTY_FILTER, label });
    expect(byLabel.every((i) => i.labels.some((l) => l.name === label))).toBe(
      true,
    );

    const noMs = applyBoardFilter(vms, {
      ...EMPTY_FILTER,
      milestone: NO_MILESTONE,
    });
    expect(noMs.every((i) => i.milestone === null)).toBe(true);
  });

  it("combines filters with AND", () => {
    const seed = vms.find((i) => i.assigneeLogin && i.labels.length)!;
    const out = applyBoardFilter(vms, {
      ...EMPTY_FILTER,
      assignee: seed.assigneeLogin,
      label: seed.labels[0].name,
    });
    expect(out).toContainEqual(seed);
    expect(
      out.every(
        (i) =>
          i.assigneeLogin === seed.assigneeLogin &&
          i.labels.some((l) => l.name === seed.labels[0].name),
      ),
    ).toBe(true);
  });
});

describe("isFilterActive", () => {
  it("is false for the empty filter, true once any field is set", () => {
    expect(isFilterActive(EMPTY_FILTER)).toBe(false);
    expect(isFilterActive({ ...EMPTY_FILTER, label: "bug" })).toBe(true);
  });
});
