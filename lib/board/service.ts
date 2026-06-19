import { STATUS, STATUS_ORDER, type StatusKey } from "@/fixtures/seed";
import type { RawIssue } from "@/lib/github/types";
import {
  resolveStatus,
  DEFAULT_LABEL_MAPPING,
  type LabelMapping,
} from "@/lib/status/resolve";

export interface ResolvedIssue extends RawIssue {
  status: StatusKey;
}

export interface BoardColumn {
  key: StatusKey;
  label: string;
  dot: string;
  count: number;
  issues: ResolvedIssue[];
}

/** Attach a resolved board status to each raw issue. */
export function resolveIssues(
  raw: RawIssue[],
  mapping: LabelMapping = DEFAULT_LABEL_MAPPING,
): ResolvedIssue[] {
  return raw.map((i) => ({
    ...i,
    status: resolveStatus({ state: i.state, labels: i.labels }, mapping),
  }));
}

/** Resolve + group raw issues into the four board columns (fixed order). */
export function buildColumns(
  raw: RawIssue[],
  mapping: LabelMapping = DEFAULT_LABEL_MAPPING,
): BoardColumn[] {
  const resolved = resolveIssues(raw, mapping);
  return STATUS_ORDER.map((key) => {
    const issues = resolved.filter((i) => i.status === key);
    return {
      key,
      label: STATUS[key].label,
      dot: STATUS[key].dot,
      count: issues.length,
      issues,
    };
  });
}
