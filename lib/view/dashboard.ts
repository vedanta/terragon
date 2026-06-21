import { STATUS, STATUS_ORDER, type StatusKey } from "@/fixtures/seed";
import { type BoardIssue } from "./board-issue";

export interface DashboardStats {
  total: number;
  open: number; // everything not Done
  inProgress: number;
  done: number;
  backburner: number;
  unassigned: number;
}

export function dashboardStats(issues: BoardIssue[]): DashboardStats {
  const by = (s: StatusKey) => issues.filter((i) => i.status === s).length;
  const done = by("done");
  return {
    total: issues.length,
    open: issues.length - done,
    inProgress: by("in-progress"),
    done,
    backburner: by("backburner"),
    unassigned: issues.filter((i) => !i.assignee).length,
  };
}

export interface DistributionSegment {
  key: StatusKey;
  label: string;
  color: string;
  count: number;
  /** Percent of total, 0–100. */
  pct: number;
}

export interface BreakdownRow {
  key: string;
  label: string;
  color: string;
  count: number;
}

const UNASSIGNED_COLOR = "#9ca3af";

/** Open issues (not Done) per assignee, with an Unassigned bucket; sorted desc. */
export function workloadByAssignee(issues: BoardIssue[]): BreakdownRow[] {
  const rows = new Map<string, BreakdownRow>();
  for (const i of issues) {
    if (i.status === "done") continue;
    const key = i.assigneeLogin ?? "__unassigned";
    const existing = rows.get(key);
    if (existing) {
      existing.count++;
    } else {
      rows.set(key, {
        key,
        label: i.assignee?.name ?? "Unassigned",
        color: i.assignee?.color ?? UNASSIGNED_COLOR,
        count: 1,
      });
    }
  }
  return [...rows.values()].sort((a, b) => b.count - a.count);
}

/** Issue counts per label (an issue may have several); sorted desc. */
export function workByLabel(issues: BoardIssue[]): BreakdownRow[] {
  const rows = new Map<string, BreakdownRow>();
  for (const i of issues) {
    for (const l of i.labels) {
      const existing = rows.get(l.name);
      if (existing) existing.count++;
      else
        rows.set(l.name, {
          key: l.name,
          label: l.name,
          color: l.color,
          count: 1,
        });
    }
  }
  return [...rows.values()].sort((a, b) => b.count - a.count);
}

/** Proportion of issues in each status, in fixed column order. */
export function statusDistribution(
  issues: BoardIssue[],
): DistributionSegment[] {
  const total = issues.length || 1;
  return STATUS_ORDER.map((key) => {
    const count = issues.filter((i) => i.status === key).length;
    return {
      key,
      label: STATUS[key].label,
      color: STATUS[key].dot,
      count,
      pct: Math.round((count / total) * 100),
    };
  });
}
