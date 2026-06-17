/**
 * Static data source for the UI. For now it serves the prototype fixtures;
 * later groups swap the implementation for live GitHub data behind the same
 * functions (controlled by USE_FIXTURES).
 */
import {
  ISSUES,
  PEOPLE,
  LABELS,
  STATUS,
  STATUS_ORDER,
  MILESTONES,
  DEMO_REPO,
  type Issue,
  type StatusKey,
} from "@/fixtures/seed";

const USE_FIXTURES = process.env.USE_FIXTURES !== "false";

export function getIssues(): Issue[] {
  return USE_FIXTURES ? ISSUES : [];
}

export function getIssuesByStatus(status: StatusKey): Issue[] {
  return getIssues().filter((i) => i.status === status);
}

export { PEOPLE, LABELS, STATUS, STATUS_ORDER, MILESTONES, DEMO_REPO };
export type { Issue, StatusKey };
