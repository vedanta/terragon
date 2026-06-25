"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getGithubToken } from "@/lib/github-token";
import { GitHubClient } from "@/lib/github/client";
import { transitionPlan, STATUS_LABEL_COLORS } from "@/lib/status/transition";
import { STATUS_ORDER, type StatusKey } from "@/fixtures/seed";
import { getCurrentRepo, getWorkspaceConfig } from "@/lib/workspace";

const USE_FIXTURES = process.env.USE_FIXTURES !== "false";

export interface MoveResult {
  ok: boolean;
  error?: string;
}

/** Move an issue's board status by writing labels (and close/reopen) to GitHub. */
export async function moveIssue(
  issueNumber: number,
  current: StatusKey,
  target: StatusKey,
): Promise<MoveResult> {
  if (current === target) return { ok: true };
  if (USE_FIXTURES) return { ok: true }; // demo board — no write

  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not signed in." };

  const repo = await getCurrentRepo(session.user.id);
  if (!repo) return { ok: false, error: "No repository selected." };

  const token = await getGithubToken(session.user.id);
  if (!token) return { ok: false, error: "No GitHub token on file." };

  const cfg = await getWorkspaceConfig(repo.id);
  const client = new GitHubClient({ token });

  try {
    await client.ensureLabels(
      repo.owner,
      repo.name,
      STATUS_ORDER.map((s) => ({
        name: cfg.labels[s],
        color: STATUS_LABEL_COLORS[s],
      })),
    );
    const plan = transitionPlan(
      current,
      target,
      { autoCloseDone: cfg.autoCloseDone },
      cfg.labels,
    );
    await client.applyTransition(repo.owner, repo.name, issueNumber, plan);
    revalidatePath("/board");
    revalidatePath("/grooming");
    return { ok: true };
  } catch (err) {
    console.error("[terragon] moveIssue failed", { issue: issueNumber }, err);
    return {
      ok: false,
      error: `Could not update #${issueNumber} on GitHub.`,
    };
  }
}

export interface CreateIssueInput {
  title: string;
  body: string;
  status: StatusKey;
  assignees: string[];
  labels: string[];
  milestone: number | null;
}

export interface CreateResult {
  ok: boolean;
  number?: number;
  url?: string;
  error?: string;
}

/** Create a GitHub issue with the chosen status label (and close it if Done). */
export async function createIssue(
  input: CreateIssueInput,
): Promise<CreateResult> {
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Title is required." };
  if (USE_FIXTURES) {
    return { ok: false, error: "Connect a repository to create issues." };
  }

  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not signed in." };

  const repo = await getCurrentRepo(session.user.id);
  if (!repo) return { ok: false, error: "No repository selected." };

  const token = await getGithubToken(session.user.id);
  if (!token) return { ok: false, error: "No GitHub token on file." };

  const cfg = await getWorkspaceConfig(repo.id);
  const client = new GitHubClient({ token });

  try {
    await client.ensureLabels(
      repo.owner,
      repo.name,
      STATUS_ORDER.map((s) => ({
        name: cfg.labels[s],
        color: STATUS_LABEL_COLORS[s],
      })),
    );
    // Status label always wins; de-dupe against any user-picked labels.
    const labels = Array.from(
      new Set([cfg.labels[input.status], ...input.labels]),
    );
    const created = await client.createIssue(repo.owner, repo.name, {
      title,
      body: input.body.trim() || undefined,
      labels,
      assignees: input.assignees,
      milestone: input.milestone,
    });
    if (input.status === "done" && cfg.autoCloseDone) {
      await client.setIssueState(
        repo.owner,
        repo.name,
        created.number,
        "closed",
      );
    }
    revalidatePath("/board");
    revalidatePath("/grooming");
    revalidatePath("/dashboard");
    return { ok: true, number: created.number, url: created.url };
  } catch (err) {
    console.error("[terragon] createIssue failed", err);
    return { ok: false, error: "Could not create the issue on GitHub." };
  }
}
