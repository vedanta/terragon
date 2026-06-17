/**
 * Seed fixtures extracted verbatim from the interactive prototype (`concept/Mise.html`).
 * Use for local development, Storybook, and tests until live GitHub data is wired in.
 *
 * NOTE: `status` here is the prototype's flat field. In production, status is resolved
 * from `terragon/*` labels + native open/closed state — see docs/architecture.md §6.
 * The relative `updated`/`time` strings are prototype display values, not real timestamps.
 */

export type StatusKey = "planned" | "in-progress" | "done" | "backburner";
export type PersonKey = "maya" | "dev" | "sam" | "tom" | "aisha";
export type LabelKey =
  | "bug" | "feature" | "ux" | "backend" | "infra" | "frontend" | "docs";

export interface Person {
  name: string;
  initials: string;
  color: string;
}

export interface Label {
  name: string;
  color: string;
}

export interface Status {
  label: string;
  /** CSS color token for the status dot. */
  dot: string;
}

export interface Comment {
  author: string;
  initials: string;
  color: string;
  text: string;
  time: string;
}

export interface Activity {
  text: string;
  time: string;
}

export interface Issue {
  number: number;
  title: string;
  status: StatusKey;
  assignee: PersonKey | null;
  milestone: string | null;
  labels: LabelKey[];
  updated: string;
  description: string;
  comments: Comment[];
  activity: Activity[];
}

export const PEOPLE: Record<PersonKey, Person> = {
  maya: { name: "Maya Chen", initials: "MC", color: "#5b5bd6" },
  dev: { name: "Dev Patel", initials: "DP", color: "#0891b2" },
  sam: { name: "Sam Rivera", initials: "SR", color: "#16a34a" },
  tom: { name: "Tom Lee", initials: "TL", color: "#ca8a04" },
  aisha: { name: "Aisha Khan", initials: "AK", color: "#e5484d" },
};

export const LABELS: Record<LabelKey, Label> = {
  bug: { name: "bug", color: "#e5484d" },
  feature: { name: "feature", color: "#5b5bd6" },
  ux: { name: "ux", color: "#9333ea" },
  backend: { name: "backend", color: "#0891b2" },
  infra: { name: "infra", color: "#ca8a04" },
  frontend: { name: "frontend", color: "#16a34a" },
  docs: { name: "docs", color: "#64748b" },
};

export const STATUS: Record<StatusKey, Status> = {
  planned: { label: "Planned", dot: "var(--text-3)" },
  "in-progress": { label: "In Progress", dot: "var(--accent)" },
  done: { label: "Done", dot: "var(--green)" },
  backburner: { label: "Backburner", dot: "#9ca3af" },
};

/** Board column order — Backburner intentionally last. */
export const STATUS_ORDER: StatusKey[] = [
  "planned",
  "in-progress",
  "done",
  "backburner",
];

export const MILESTONES: string[] = [
  "v1.2 Launch",
  "Auth Revamp",
  "Billing",
  "Performance",
  "Q3 Polish",
];

const cm = (
  author: string,
  key: PersonKey,
  text: string,
  time: string,
): Comment => ({
  author,
  initials: PEOPLE[key].initials,
  color: PEOPLE[key].color,
  text,
  time,
});

const act = (text: string, time: string): Activity => ({ text, time });

const mk = (
  number: number,
  title: string,
  status: StatusKey,
  assignee: PersonKey | null,
  milestone: string | null,
  labels: LabelKey[],
  updated: string,
  description: string,
  comments: Comment[] = [],
  activity?: Activity[],
): Issue => ({
  number,
  title,
  status,
  assignee,
  milestone,
  labels,
  updated,
  description,
  comments,
  activity: activity ?? [act("opened this issue", updated)],
});

export const ISSUES: Issue[] = [
  // Planned
  mk(155, "Onboarding checklist component", "planned", "sam", "v1.2 Launch", ["ux", "frontend"], "2h ago",
    "Progressive checklist shown on first login: connect repo, invite team, create first issue. Dismissible and remembers state per user.",
    [cm("Maya Chen", "maya", "Let us keep it to 4 steps max so it does not feel like a chore.", "1h ago")]),
  mk(151, "Usage-based billing meter in dashboard", "planned", "dev", "Billing", ["feature", "frontend"], "5h ago",
    "Show current period usage against plan limits with a clear meter. Should update from the metering events stream."),
  mk(149, "Rate limit public API endpoints", "planned", "dev", "Performance", ["backend", "infra"], "yesterday",
    "Add per-token rate limiting on the public API. Return 429 with Retry-After. Document limits in the API reference."),
  mk(142, "Add passkey (WebAuthn) login option", "planned", "aisha", "Auth Revamp", ["feature", "backend"], "yesterday",
    "Allow users to register and sign in with a passkey via the WebAuthn API, alongside password and SSO on the auth screen.",
    [cm("Aisha Khan", "aisha", "Scoping the registration ceremony first, sign-in flow follows.", "1d ago")]),
  mk(138, "Empty states for new workspaces", "planned", "sam", "v1.2 Launch", ["ux", "frontend"], "2d ago",
    "Design and build empty states for board, milestones and search when a workspace has no data yet."),

  // In Progress
  mk(129, "Migrate session store to Redis", "in-progress", "dev", "Performance", ["backend", "infra"], "3h ago",
    "Move sessions off Postgres into Redis to cut auth latency. Needs a dual-write window before cutover.",
    [cm("Dev Patel", "dev", "Dual-write is live in staging, p99 auth down ~40%.", "2h ago"), cm("Tom Lee", "tom", "Nice. Lets watch eviction metrics before prod.", "1h ago")],
    [act("opened this issue", "4d ago"), act("moved to In Progress", "3d ago"), act("linked PR #312", "3h ago")]),
  mk(144, "Redesign settings navigation", "in-progress", "maya", "v1.2 Launch", ["ux", "frontend"], "6h ago",
    "Replace the flat settings list with grouped sections and a left rail. Keep deep links working.",
    [cm("Maya Chen", "maya", "Pushed a first pass, grouping into Account / Workspace / Billing / Developer.", "5h ago")],
    [act("opened this issue", "5d ago"), act("moved to In Progress", "2d ago")]),
  mk(147, "Stripe webhook retry handling", "in-progress", "dev", "Billing", ["backend", "bug"], "yesterday",
    "Webhooks occasionally double-process on retry. Make handlers idempotent keyed on event id.",
    [], [act("opened this issue", "2d ago"), act("moved to In Progress", "1d ago")]),

  // Done
  mk(121, "Dark mode across app shell", "done", "maya", "v1.2 Launch", ["ux", "frontend"], "2d ago",
    "Full dark theme using design tokens. Respect system preference with a manual override in settings.",
    [cm("Sam Rivera", "sam", "Shipped, looks great. Contrast all passes AA.", "2d ago")],
    [act("opened this issue", "8d ago"), act("moved to Done", "2d ago")]),
  mk(118, "SSO via Google Workspace", "done", "aisha", "Auth Revamp", ["feature", "backend"], "4d ago",
    "OIDC sign-in with Google Workspace, domain-restricted for org accounts.",
    [], [act("opened this issue", "12d ago"), act("moved to Done", "4d ago")]),
  mk(133, "Fix flaky CI on integration tests", "done", "tom", "Performance", ["infra", "bug"], "5d ago",
    "Integration suite intermittently times out on the DB container. Add health-check wait and bump pool.",
    [], [act("opened this issue", "9d ago"), act("moved to Done", "5d ago")]),
  mk(126, "Audit log export (CSV)", "done", "sam", "v1.2 Launch", ["feature"], "6d ago",
    "Let admins export the audit log to CSV filtered by date range and actor.",
    [], [act("opened this issue", "10d ago"), act("moved to Done", "6d ago")]),

  // Backburner
  mk(162, "Slack notifications integration", "backburner", "tom", null, ["feature", "backend"], "1w ago",
    "Post issue status changes and mentions to a configured Slack channel. Deferred until after launch."),
  mk(160, "Mobile companion app spike", "backburner", null, "Q3 Polish", ["feature"], "1w ago",
    "Research a lightweight mobile app for triage on the go. Spike only, no commitment."),
  mk(157, "Custom theme builder", "backburner", "maya", "Q3 Polish", ["ux"], "2w ago",
    "Let workspaces define accent and surface colors. Someday-maybe, low priority."),
  mk(99, "GraphQL gateway exploration", "backburner", "dev", null, ["backend"], "3w ago",
    "Evaluate a GraphQL gateway in front of the REST services. Exploratory."),
];

/** Demo repository the prototype issues belong to. */
export const DEMO_REPO = "acme / platform";
