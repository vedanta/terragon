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
