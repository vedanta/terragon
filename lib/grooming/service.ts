import {
  transitionPlan,
  type StatusLabels,
  type TransitionPlan,
} from "@/lib/status/transition";
import { type StatusKey } from "@/fixtures/seed";

/** A staged change to apply to many issues. `undefined` = leave unchanged. */
export interface Changeset {
  status?: StatusKey;
  assignee?: string | null; // null = unassign
  milestone?: number | null; // null = clear
  addLabels?: string[];
  removeLabels?: string[];
}

export interface IssueRef {
  number: number;
  status: StatusKey;
}

export interface IssueOps {
  number: number;
  transition?: TransitionPlan;
  assignees?: string[];
  milestone?: number | null;
  addLabels: string[];
  removeLabels: string[];
}

export interface BatchConfig {
  labels: StatusLabels;
  autoCloseDone: boolean;
}

export interface BatchResult {
  updated: number[];
  failed: { number: number; reason: string }[];
}

/** The client surface executePlan needs (GitHubClient satisfies it). */
export interface BatchClient {
  run<T>(fn: () => Promise<T>): Promise<T>;
  applyTransition(
    owner: string,
    repo: string,
    issue: number,
    plan: TransitionPlan,
  ): Promise<void>;
  addLabel(
    owner: string,
    repo: string,
    issue: number,
    label: string,
  ): Promise<void>;
  removeLabel(
    owner: string,
    repo: string,
    issue: number,
    label: string,
  ): Promise<void>;
  setAssignees(
    owner: string,
    repo: string,
    issue: number,
    logins: string[],
  ): Promise<void>;
  setMilestone(
    owner: string,
    repo: string,
    issue: number,
    milestone: number | null,
  ): Promise<void>;
}

/** Pure: turn a selection + changeset into per-issue operations. */
export function buildPlan(
  issues: IssueRef[],
  cs: Changeset,
  config: BatchConfig,
): IssueOps[] {
  return issues.map((i) => {
    const ops: IssueOps = {
      number: i.number,
      addLabels: cs.addLabels ?? [],
      removeLabels: cs.removeLabels ?? [],
    };
    if (cs.status && cs.status !== i.status) {
      ops.transition = transitionPlan(
        i.status,
        cs.status,
        { autoCloseDone: config.autoCloseDone },
        config.labels,
      );
    }
    if (cs.assignee !== undefined)
      ops.assignees = cs.assignee ? [cs.assignee] : [];
    if (cs.milestone !== undefined) ops.milestone = cs.milestone;
    return ops;
  });
}

function reasonOf(err: unknown): string {
  const m = (err as { message?: string })?.message;
  return m ? String(m) : "unknown error";
}

/**
 * Apply each issue's ops through the client's concurrency pool. Never aborts on
 * a single failure — collects partial results.
 */
export async function executePlan(
  client: BatchClient,
  owner: string,
  repo: string,
  ops: IssueOps[],
): Promise<BatchResult> {
  const updated: number[] = [];
  const failed: { number: number; reason: string }[] = [];

  await Promise.all(
    ops.map((o) =>
      client.run(async () => {
        try {
          if (o.transition) {
            await client.applyTransition(owner, repo, o.number, o.transition);
          }
          for (const l of o.addLabels) {
            await client.addLabel(owner, repo, o.number, l);
          }
          for (const l of o.removeLabels) {
            await client.removeLabel(owner, repo, o.number, l);
          }
          if (o.assignees !== undefined) {
            await client.setAssignees(owner, repo, o.number, o.assignees);
          }
          if (o.milestone !== undefined) {
            await client.setMilestone(owner, repo, o.number, o.milestone);
          }
          updated.push(o.number);
        } catch (err) {
          failed.push({ number: o.number, reason: reasonOf(err) });
        }
      }),
    ),
  );

  updated.sort((a, b) => a - b);
  failed.sort((a, b) => a.number - b.number);
  return { updated, failed };
}
