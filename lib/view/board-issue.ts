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
  assigneeLogin: string | null;
  labels: Label[];
  milestone: string | null;
  updated: string;
  /** Sortable recency key (higher = newer). Comparable only within one source. */
  updatedRank: number;
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

const RELATIVE_UNITS: Record<string, number> = {
  m: 60,
  h: 3600,
  d: 86400,
  w: 604800,
  mo: 2592000,
};

/**
 * Inverse of {@link relativeTime} for sorting: a display string like "2h ago"
 * → seconds-ago (0 for "just now"). Unparseable input sorts as very old.
 */
export function parseRelativeSeconds(s: string): number {
  if (/just now/i.test(s)) return 0;
  const m = s.match(/(\d+)\s*(mo|[mhdw])/i);
  if (!m) return Number.MAX_SAFE_INTEGER;
  return Number(m[1]) * (RELATIVE_UNITS[m[2].toLowerCase()] ?? 1);
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
    assigneeLogin: i.assignee ?? null,
    labels: i.labels.map((k) => LABELS[k]),
    milestone: i.milestone,
    updated: i.updated,
    updatedRank: -parseRelativeSeconds(i.updated),
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
          avatarUrl: a.avatarUrl,
        }
      : null,
    assigneeLogin: a?.login ?? null,
    labels: i.labels.map((name) => ({ name, color: colorFor(name) })),
    milestone: i.milestone,
    updated: relativeTime(i.updatedAt),
    updatedRank: Date.parse(i.updatedAt) || 0,
    description: i.body,
    url: i.url,
    comments: [],
    activity: [],
  };
}

export interface MilestoneGroup {
  title: string;
  total: number;
  done: number;
  issues: BoardIssue[];
}

/** Group issues by milestone (null → "No milestone"), with done counts. */
export function groupByMilestone(issues: BoardIssue[]): MilestoneGroup[] {
  const map = new Map<string, BoardIssue[]>();
  for (const i of issues) {
    const key = i.milestone ?? "No milestone";
    const list = map.get(key);
    if (list) list.push(i);
    else map.set(key, [i]);
  }
  return [...map.entries()].map(([title, list]) => ({
    title,
    total: list.length,
    done: list.filter((i) => i.status === "done").length,
    issues: list,
  }));
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
