"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getGithubToken } from "@/lib/github-token";
import { GitHubClient } from "@/lib/github/client";
import { getCurrentRepo } from "@/lib/workspace";

const USE_FIXTURES = process.env.USE_FIXTURES !== "false";

export interface EditResult {
  ok: boolean;
  error?: string;
}

type Ctx =
  | { fixtures: true }
  | { error: string }
  | { client: GitHubClient; owner: string; repo: string };

async function resolveCtx(): Promise<Ctx> {
  if (USE_FIXTURES) return { fixtures: true };
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };
  const repo = await getCurrentRepo(session.user.id);
  if (!repo) return { error: "No repository selected." };
  const token = await getGithubToken(session.user.id);
  if (!token) return { error: "No GitHub token on file." };
  return {
    client: new GitHubClient({ token }),
    owner: repo.owner,
    repo: repo.name,
  };
}

function revalidate(): EditResult {
  revalidatePath("/board");
  revalidatePath("/grooming");
  return { ok: true };
}

async function withClient(
  issueNumber: number,
  run: (c: GitHubClient, owner: string, repo: string) => Promise<void>,
): Promise<EditResult> {
  const ctx = await resolveCtx();
  if ("fixtures" in ctx) return { ok: true };
  if ("error" in ctx) return { ok: false, error: ctx.error };
  try {
    await run(ctx.client, ctx.owner, ctx.repo);
    return revalidate();
  } catch {
    return { ok: false, error: `Could not update #${issueNumber} on GitHub.` };
  }
}

export async function saveIssueText(
  number: number,
  title: string,
  body: string,
): Promise<EditResult> {
  return withClient(number, (c, o, r) =>
    c.updateIssue(o, r, number, { title, body }),
  );
}

export async function setAssignee(
  number: number,
  login: string | null,
): Promise<EditResult> {
  return withClient(number, (c, o, r) =>
    c.setAssignees(o, r, number, login ? [login] : []),
  );
}

export async function setMilestone(
  number: number,
  milestone: number | null,
): Promise<EditResult> {
  return withClient(number, (c, o, r) =>
    c.setMilestone(o, r, number, milestone),
  );
}

export async function addLabel(
  number: number,
  label: string,
): Promise<EditResult> {
  return withClient(number, (c, o, r) => c.addLabel(o, r, number, label));
}

export async function removeLabel(
  number: number,
  label: string,
): Promise<EditResult> {
  return withClient(number, (c, o, r) => c.removeLabel(o, r, number, label));
}
