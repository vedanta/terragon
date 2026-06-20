"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { syncEvents } from "@/db/schema";
import { getGithubToken } from "@/lib/github-token";
import { GitHubClient } from "@/lib/github/client";
import { getCurrentRepo, getWorkspaceConfig } from "@/lib/workspace";
import { STATUS_LABEL_COLORS } from "@/lib/status/transition";
import { STATUS_ORDER } from "@/fixtures/seed";
import {
  buildPlan,
  executePlan,
  type Changeset,
  type IssueRef,
  type BatchResult,
} from "@/lib/grooming/service";

const USE_FIXTURES = process.env.USE_FIXTURES !== "false";

function failAll(selection: IssueRef[], reason: string): BatchResult {
  return {
    updated: [],
    failed: selection.map((s) => ({ number: s.number, reason })),
  };
}

/** Apply a staged change-set to the selected issues, with partial-success reporting. */
export async function applyBatch(
  selection: IssueRef[],
  changeset: Changeset,
): Promise<BatchResult> {
  if (selection.length === 0) return { updated: [], failed: [] };
  if (USE_FIXTURES) {
    return {
      updated: selection.map((s) => s.number).sort((a, b) => a - b),
      failed: [],
    };
  }

  const session = await auth();
  if (!session?.user) return failAll(selection, "Not signed in.");
  const repo = await getCurrentRepo(session.user.id);
  const token = repo ? await getGithubToken(session.user.id) : null;
  if (!repo || !token) return failAll(selection, "No repository or token.");

  const config = await getWorkspaceConfig(repo.id);
  const client = new GitHubClient({ token });

  if (changeset.status) {
    try {
      await client.ensureLabels(
        repo.owner,
        repo.name,
        STATUS_ORDER.map((s) => ({
          name: config.labels[s],
          color: STATUS_LABEL_COLORS[s],
        })),
      );
    } catch {
      /* best-effort; the resolver self-heals */
    }
  }

  const ops = buildPlan(selection, changeset, {
    labels: config.labels,
    autoCloseDone: config.autoCloseDone,
  });
  const result = await executePlan(client, repo.owner, repo.name, ops);

  if (result.failed.length > 0) {
    console.error("[terragon] applyBatch partial failure", {
      count: selection.length,
      failed: result.failed.length,
    });
  }

  try {
    await db.insert(syncEvents).values({
      repositoryId: repo.id,
      eventType: "batch_update",
      status: result.failed.length === 0 ? "ok" : "partial",
      payload: JSON.stringify({
        count: selection.length,
        updated: result.updated.length,
        failed: result.failed.length,
      }),
      errorMessage: result.failed.length
        ? result.failed
            .map((f) => `#${f.number}: ${f.reason}`)
            .join("; ")
            .slice(0, 1000)
        : null,
    });
  } catch {
    /* audit is best-effort */
  }

  revalidatePath("/board");
  revalidatePath("/grooming");
  return result;
}
