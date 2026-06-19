import { Octokit } from "octokit";
import pLimit from "p-limit";
import type { Page, RawIssue } from "./types";

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
  /** Max concurrent calls for batched work (writes/grooming in later groups). */
  concurrency?: number;
  retry?: { attempts?: number; baseDelayMs?: number };
}

/**
 * The single module that talks to GitHub. Callers never see GraphQL vs REST.
 * Reads use GraphQL; rate-limit handling (retry + backoff) and a concurrency
 * limiter live here so every caller inherits them.
 */
export class GitHubClient {
  private gql: GraphQLFn;
  private limit: ReturnType<typeof pLimit>;
  private attempts: number;
  private baseDelayMs: number;

  constructor(opts: GitHubClientOptions) {
    if (opts.graphql) {
      this.gql = opts.graphql;
    } else {
      const ok = opts.octokit ?? new Octokit({ auth: opts.token });
      this.gql = (query, vars) => ok.graphql(query, vars);
    }
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
