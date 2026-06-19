import { Octokit } from "octokit";
import pLimit from "p-limit";
import type { Page, RawIssue } from "./types";
import type { TransitionPlan } from "@/lib/status/transition";

/* ---- GraphQL response shapes (typed to avoid `any`) ---- */

interface GqlIssueNode {
  number: number;
  title: string;
  body: string | null;
  state: string;
  url: string;
  updatedAt: string;
  labels: { nodes: { name: string }[] };
  assignees: {
    nodes: { login: string; name: string | null; avatarUrl: string }[];
  };
  milestone: { title: string } | null;
}

interface GqlIssuesResponse {
  repository: {
    issues: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: GqlIssueNode[];
    };
  };
}

type GraphQLFn = <T>(
  query: string,
  vars?: Record<string, unknown>,
) => Promise<T>;

/** The REST operations the client needs (injectable for tests). */
export interface RestOps {
  listLabelNames(owner: string, repo: string): Promise<string[]>;
  createLabel(
    owner: string,
    repo: string,
    name: string,
    color: string,
  ): Promise<void>;
  addLabels(
    owner: string,
    repo: string,
    issue: number,
    labels: string[],
  ): Promise<void>;
  removeLabel(
    owner: string,
    repo: string,
    issue: number,
    name: string,
  ): Promise<void>;
  setIssueState(
    owner: string,
    repo: string,
    issue: number,
    state: "open" | "closed",
  ): Promise<void>;
}

const ISSUES_QUERY = `
  query ($owner: String!, $repo: String!, $cursor: String) {
    repository(owner: $owner, name: $repo) {
      issues(first: 50, after: $cursor, states: [OPEN, CLOSED], orderBy: { field: UPDATED_AT, direction: DESC }) {
        pageInfo { hasNextPage endCursor }
        nodes {
          number title body state url updatedAt
          labels(first: 30) { nodes { name } }
          assignees(first: 10) { nodes { login name avatarUrl } }
          milestone { title }
        }
      }
    }
  }
`;

export interface GitHubClientOptions {
  token?: string;
  octokit?: Octokit;
  /** Inject a GraphQL fn directly (tests). */
  graphql?: GraphQLFn;
  /** Inject REST operations directly (tests). */
  rest?: RestOps;
  /** Max concurrent calls for batched work. */
  concurrency?: number;
  retry?: { attempts?: number; baseDelayMs?: number };
}

export interface LabelSpec {
  name: string;
  color: string;
}

/**
 * The single module that talks to GitHub. Callers never see GraphQL vs REST.
 * Reads use GraphQL, writes use REST; rate-limit backoff + a concurrency limiter
 * live here so every caller inherits them.
 */
export class GitHubClient {
  private gql: GraphQLFn;
  private rest: RestOps;
  private limit: ReturnType<typeof pLimit>;
  private attempts: number;
  private baseDelayMs: number;

  constructor(opts: GitHubClientOptions) {
    const ok =
      opts.octokit ??
      (opts.graphql ? undefined : new Octokit({ auth: opts.token }));
    this.gql = opts.graphql ?? ((query, vars) => ok!.graphql(query, vars));
    this.rest = opts.rest ?? (ok ? restFromOctokit(ok) : throwingRest());
    this.limit = pLimit(opts.concurrency ?? 4);
    this.attempts = opts.retry?.attempts ?? 4;
    this.baseDelayMs = opts.retry?.baseDelayMs ?? 500;
  }

  /** One page of issues (OPEN+CLOSED, newest first). */
  async listIssues(
    owner: string,
    repo: string,
    cursor: string | null = null,
  ): Promise<Page<RawIssue>> {
    const data = await this.withBackoff(() =>
      this.gql<GqlIssuesResponse>(ISSUES_QUERY, { owner, repo, cursor }),
    );
    const conn = data.repository.issues;
    return {
      items: conn.nodes.map(mapIssue),
      endCursor: conn.pageInfo.endCursor,
      hasNextPage: conn.pageInfo.hasNextPage,
    };
  }

  /** All issues, following pagination. */
  async listAllIssues(owner: string, repo: string): Promise<RawIssue[]> {
    const all: RawIssue[] = [];
    let cursor: string | null = null;
    do {
      const page = await this.listIssues(owner, repo, cursor);
      all.push(...page.items);
      cursor = page.hasNextPage ? page.endCursor : null;
    } while (cursor);
    return all;
  }

  /** Create any of the given labels that don't already exist on the repo. */
  async ensureLabels(
    owner: string,
    repo: string,
    labels: LabelSpec[],
  ): Promise<void> {
    const existing = new Set(
      await this.withBackoff(() => this.rest.listLabelNames(owner, repo)),
    );
    for (const l of labels) {
      if (!existing.has(l.name)) {
        await this.withBackoff(() =>
          this.rest.createLabel(owner, repo, l.name, l.color),
        );
      }
    }
  }

  /** Execute a status transition: add target label first, then remove others, then close/reopen. */
  async applyTransition(
    owner: string,
    repo: string,
    issue: number,
    plan: TransitionPlan,
  ): Promise<void> {
    await this.withBackoff(() =>
      this.rest.addLabels(owner, repo, issue, [plan.addLabel]),
    );
    for (const name of plan.removeLabels) {
      await this.withBackoff(() =>
        this.rest.removeLabel(owner, repo, issue, name),
      );
    }
    if (plan.close) {
      await this.withBackoff(() =>
        this.rest.setIssueState(owner, repo, issue, "closed"),
      );
    }
    if (plan.reopen) {
      await this.withBackoff(() =>
        this.rest.setIssueState(owner, repo, issue, "open"),
      );
    }
  }

  /** Run a task through the shared concurrency limiter. */
  run<T>(task: () => Promise<T>): Promise<T> {
    return this.limit(task);
  }

  private async withBackoff<T>(fn: () => Promise<T>): Promise<T> {
    let delay = this.baseDelayMs;
    for (let i = 0; ; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i >= this.attempts - 1 || !isRateLimited(err)) throw err;
        if (delay > 0) await sleep(delay);
        delay *= 2;
      }
    }
  }
}

function restFromOctokit(ok: Octokit): RestOps {
  return {
    async listLabelNames(owner, repo) {
      const res = await ok.rest.issues.listLabelsForRepo({
        owner,
        repo,
        per_page: 100,
      });
      return res.data.map((l) => l.name);
    },
    async createLabel(owner, repo, name, color) {
      await ok.rest.issues.createLabel({ owner, repo, name, color });
    },
    async addLabels(owner, repo, issue_number, labels) {
      await ok.rest.issues.addLabels({ owner, repo, issue_number, labels });
    },
    async removeLabel(owner, repo, issue_number, name) {
      try {
        await ok.rest.issues.removeLabel({ owner, repo, issue_number, name });
      } catch (err) {
        if ((err as { status?: number }).status !== 404) throw err;
      }
    },
    async setIssueState(owner, repo, issue_number, state) {
      await ok.rest.issues.update({ owner, repo, issue_number, state });
    },
  };
}

function throwingRest(): RestOps {
  const fail = () => {
    throw new Error("GitHubClient: no REST transport configured");
  };
  return {
    listLabelNames: fail,
    createLabel: fail,
    addLabels: fail,
    removeLabel: fail,
    setIssueState: fail,
  };
}

function mapIssue(n: GqlIssueNode): RawIssue {
  return {
    number: n.number,
    title: n.title,
    body: n.body ?? "",
    state: n.state.toLowerCase() === "closed" ? "closed" : "open",
    url: n.url,
    updatedAt: n.updatedAt,
    labels: n.labels.nodes.map((l) => l.name),
    assignees: n.assignees.nodes.map((a) => ({
      login: a.login,
      name: a.name,
      avatarUrl: a.avatarUrl,
    })),
    milestone: n.milestone?.title ?? null,
  };
}

export function isRateLimited(err: unknown): boolean {
  const e = err as {
    status?: number;
    response?: { status?: number };
    message?: string;
  };
  const status = e?.status ?? e?.response?.status;
  const msg = (e?.message ?? "").toLowerCase();
  return (
    status === 403 ||
    status === 429 ||
    msg.includes("rate limit") ||
    msg.includes("secondary") ||
    msg.includes("abuse")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
