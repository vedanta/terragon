"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { repositories, userRepositories } from "@/db/schema";

/** Upsert the chosen repository and mark it most-recently-opened for the user. */
export async function selectRepo(formData: FormData) {
  const session = await auth();
  if (!session?.user) return;

  const githubRepoId = String(formData.get("id"));
  const owner = String(formData.get("owner"));
  const name = String(formData.get("name"));
  const fullName = String(formData.get("fullName"));
  const isPrivate = formData.get("private") === "true";
  const defaultBranch = String(formData.get("defaultBranch") || "main");

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
}
