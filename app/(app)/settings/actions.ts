"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { repositories, userRepositories } from "@/db/schema";
import { getCurrentRepo, saveWorkspaceConfig } from "@/lib/workspace";

export interface RepoChoice {
  githubRepoId: string;
  owner: string;
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
}

/** Upsert a repo + mark it the user's active (most-recently-opened) repository. */
export async function chooseRepo(repo: RepoChoice) {
  const session = await auth();
  if (!session?.user) return;

  const {
    githubRepoId,
    owner,
    name,
    fullName,
    private: isPrivate,
    defaultBranch,
  } = repo;

  const existing = await db
    .select({ id: repositories.id })
    .from(repositories)
    .where(eq(repositories.githubRepoId, githubRepoId))
    .limit(1);

  let repoId: string;
  if (existing[0]) {
    repoId = existing[0].id;
    await db
      .update(repositories)
      .set({
        owner,
        name,
        fullName,
        private: isPrivate,
        defaultBranch,
        updatedAt: new Date(),
      })
      .where(eq(repositories.id, repoId));
  } else {
    const inserted = await db
      .insert(repositories)
      .values({
        githubRepoId,
        owner,
        name,
        fullName,
        private: isPrivate,
        defaultBranch,
      })
      .returning({ id: repositories.id });
    repoId = inserted[0].id;
  }

  const link = await db
    .select({ id: userRepositories.id })
    .from(userRepositories)
    .where(
      and(
        eq(userRepositories.userId, session.user.id),
        eq(userRepositories.repositoryId, repoId),
      ),
    )
    .limit(1);

  if (link[0]) {
    await db
      .update(userRepositories)
      .set({ lastOpenedAt: new Date() })
      .where(eq(userRepositories.id, link[0].id));
  } else {
    await db.insert(userRepositories).values({
      userId: session.user.id,
      repositoryId: repoId,
      lastOpenedAt: new Date(),
    });
  }

  revalidatePath("/settings");
  revalidatePath("/board");
  revalidatePath("/grooming");
  revalidatePath("/dashboard");
}

/** Persist the workspace's status-label names + auto-close behavior. */
export async function saveWorkspace(formData: FormData) {
  const session = await auth();
  if (!session?.user) return;
  const repo = await getCurrentRepo(session.user.id);
  if (!repo) return;

  await saveWorkspaceConfig(repo.id, {
    labels: {
      planned: String(formData.get("label-planned") || "terragon/planned"),
      "in-progress": String(
        formData.get("label-in-progress") || "terragon/in-progress",
      ),
      done: String(formData.get("label-done") || "terragon/done"),
      backburner: String(
        formData.get("label-backburner") || "terragon/backburner",
      ),
    },
    autoCloseDone: formData.get("autoCloseDone") === "on",
  });
  revalidatePath("/settings");
}
