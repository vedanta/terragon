import type { BoardIssue } from "./board-issue";

/** Sentinel values for the "no value" buckets (distinct from "all" = null). */
export const UNASSIGNED = "__unassigned__";
export const NO_MILESTONE = "__none__";

/** Active board filter. `null` on a field means "all" (no constraint). */
export interface BoardFilter {
  /** Assignee login, or {@link UNASSIGNED}, or null for all. */
  assignee: string | null;
  /** Label name, or null for all. */
  label: string | null;
  /** Milestone title, or {@link NO_MILESTONE}, or null for all. */
  milestone: string | null;
}

export const EMPTY_FILTER: BoardFilter = {
  assignee: null,
  label: null,
  milestone: null,
};

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterOptions {
  assignees: FilterOption[];
  labels: FilterOption[];
  milestones: FilterOption[];
}

export function isFilterActive(f: BoardFilter): boolean {
  return f.assignee !== null || f.label !== null || f.milestone !== null;
}

const byLabel = (a: FilterOption, b: FilterOption) =>
  a.label.localeCompare(b.label);

/** Build the dropdown choices from the loaded issues (no extra API calls). */
export function deriveFilterOptions(issues: BoardIssue[]): FilterOptions {
  const assignees = new Map<string, string>();
  const labels = new Map<string, string>();
  const milestones = new Set<string>();
  let hasUnassigned = false;
  let hasNoMilestone = false;

  for (const i of issues) {
    if (i.assigneeLogin) {
      assignees.set(i.assigneeLogin, i.assignee?.name ?? i.assigneeLogin);
    } else {
      hasUnassigned = true;
    }
    for (const l of i.labels) labels.set(l.name, l.name);
    if (i.milestone) milestones.add(i.milestone);
    else hasNoMilestone = true;
  }

  const assigneeOpts = [...assignees].map(([value, label]) => ({
    value,
    label,
  }));
  assigneeOpts.sort(byLabel);
  if (hasUnassigned) {
    assigneeOpts.push({ value: UNASSIGNED, label: "Unassigned" });
  }

  const labelOpts = [...labels.keys()].map((name) => ({
    value: name,
    label: name,
  }));
  labelOpts.sort(byLabel);

  const milestoneOpts = [...milestones].map((title) => ({
    value: title,
    label: title,
  }));
  milestoneOpts.sort(byLabel);
  if (hasNoMilestone) {
    milestoneOpts.push({ value: NO_MILESTONE, label: "No milestone" });
  }

  return {
    assignees: assigneeOpts,
    labels: labelOpts,
    milestones: milestoneOpts,
  };
}

/** Apply the filter. Fields combine with AND; a null field is ignored. */
export function applyBoardFilter(
  issues: BoardIssue[],
  f: BoardFilter,
): BoardIssue[] {
  return issues.filter((i) => {
    if (f.assignee !== null) {
      const match =
        f.assignee === UNASSIGNED
          ? i.assigneeLogin === null
          : i.assigneeLogin === f.assignee;
      if (!match) return false;
    }
    if (f.label !== null && !i.labels.some((l) => l.name === f.label)) {
      return false;
    }
    if (f.milestone !== null) {
      const match =
        f.milestone === NO_MILESTONE
          ? i.milestone === null
          : i.milestone === f.milestone;
      if (!match) return false;
    }
    return true;
  });
}
