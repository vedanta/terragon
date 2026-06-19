import {
  PEOPLE,
  LABELS,
  STATUS,
  STATUS_ORDER,
  type Issue,
  type Person,
  type Label,
  type Comment,
  type Activity,
  type StatusKey,
} from "@/fixtures/seed";
import type { ResolvedIssue } from "@/lib/board/service";

/** The single presentation shape the UI renders — produced from fixtures or live data. */
export interface BoardIssue {
  number: number;
  title: string;
  status: StatusKey;
  assignee: Person | null;
  labels: Label[];
  milestone: string | null;
  updated: string;
  description: string;
  url: string;
  comments: Comment[];
  activity: Activity[];
}

export interface BoardColumn {
  key: StatusKey;
  label: string;
  dot: string;
  count: number;
  issues: BoardIssue[];
}

// Deterministic color for live logins/labels (fixtures carry their own colors).
const PALETTE = [
  "#5b5bd6",
  "#0891b2",
  "#16a34a",
  "#ca8a04",
  "#e5484d",
  "#9333ea",
  "#64748b",
];

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

/** Fixture issue → BoardIssue (resolves PEOPLE/LABELS keys). */
export function fromFixtureIssue(i: Issue): BoardIssue {
  return {
    number: i.number,
    title: i.title,
    status: i.status,
    assignee: i.assignee ? PEOPLE[i.assignee] : null,
    labels: i.labels.map((k) => LABELS[k]),
    milestone: i.milestone,
    updated: i.updated,
    description: i.description,
    url: `https://github.com/acme/platform/issues/${i.number}`,
    comments: i.comments,
    activity: i.activity,
  };
}

/** Live resolved issue → BoardIssue (derives presentation from raw fields). */
export function fromResolvedIssue(i: ResolvedIssue): BoardIssue {
  const a = i.assignees[0];
  return {
    number: i.number,
    title: i.title,
    status: i.status,
    assignee: a
      ? {
          name: a.name ?? a.login,
          initials: initials(a.name ?? a.login),
          color: colorFor(a.login),
        }
      : null,
    labels: i.labels.map((name) => ({ name, color: colorFor(name) })),
    milestone: i.milestone,
    updated: relativeTime(i.updatedAt),
    description: i.body,
    url: i.url,
    comments: [],
    activity: [],
  };
}

export function groupBoardIssues(issues: BoardIssue[]): BoardColumn[] {
  return STATUS_ORDER.map((key) => {
    const list = issues.filter((i) => i.status === key);
    return {
      key,
      label: STATUS[key].label,
      dot: STATUS[key].dot,
      count: list.length,
      issues: list,
    };
  });
}
