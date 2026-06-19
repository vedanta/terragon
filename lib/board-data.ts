import "server-only";
import { cache } from "react";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { repositories, userRepositories } from "@/db/schema";
import { getGithubToken } from "@/lib/github-token";
import { GitHubClient } from "@/lib/github/client";
import { resolveIssues } from "@/lib/board/service";
import {
  fromFixtureIssue,
  fromResolvedIssue,
  type BoardIssue,
} from "@/lib/view/board-issue";
import { ISSUES } from "@/fixtures/seed";

const USE_FIXTURES = process.env.USE_FIXTURES !== "false";

export interface BoardData {
  source: "fixtures" | "live";
  repo: string | null;
  issues: BoardIssue[];
  error?: string;
}

async function loadBoardData(): Promise<BoardData> {
  if (USE_FIXTURES) {
    return {
      source: "fixtures",
      repo: "acme/platform",
      issues: ISSUES.map(fromFixtureIssue),
    };
  }

  const session = await auth();
  if (!session?.user) return { source: "live", repo: null, issues: [] };

  const rows = await db
    .select({
      owner: repositories.owner,
      name: repositories.name,
      fullName: repositories.fullName,
    })
    .from(userRepositories)
    .innerJoin(repositories, eq(userRepositories.repositoryId, repositories.id))
    .where(eq(userRepositories.userId, session.user.id))
    .orderBy(desc(userRepositories.lastOpenedAt))
    .limit(1);

  const repo = rows[0];
  if (!repo) return { source: "live", repo: null, issues: [] };

  const token = await getGithubToken(session.user.id);
  if (!token) {
    return {
      source: "live",
      repo: repo.fullName,
      issues: [],
      error: "No GitHub token on file — sign out and back in.",
    };
  }

  try {
    const client = new GitHubClient({ token });
    const raw = await client.listAllIssues(repo.owner, repo.name);
    return {
      source: "live",
      repo: repo.fullName,
      issues: resolveIssues(raw).map(fromResolvedIssue),
    };
  } catch {
    return {
      source: "live",
      repo: repo.fullName,
      issues: [],
      error: "Could not load issues from GitHub. Try refreshing.",
    };
  }
}

/** Memoized per request so layout + page share one fetch. */
export const getBoardData = cache(loadBoardData);
