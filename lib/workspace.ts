import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { repositories, userRepositories, workspaceSettings } from "@/db/schema";
import {
  DEFAULT_STATUS_LABELS,
  type StatusLabels,
} from "@/lib/status/transition";

export interface CurrentRepo {
  id: string;
  owner: string;
  name: string;
  fullName: string;
}

/** The user's most-recently-opened repository (with its DB id). */
export async function getCurrentRepo(
  userId: string,
): Promise<CurrentRepo | null> {
  const rows = await db
    .select({
      id: repositories.id,
      owner: repositories.owner,
      name: repositories.name,
      fullName: repositories.fullName,
    })
    .from(userRepositories)
    .innerJoin(repositories, eq(userRepositories.repositoryId, repositories.id))
    .where(eq(userRepositories.userId, userId))
    .orderBy(desc(userRepositories.lastOpenedAt))
    .limit(1);
  return rows[0] ?? null;
}

export interface WorkspaceConfig {
  labels: StatusLabels;
  autoCloseDone: boolean;
}

export async function getWorkspaceConfig(
  repositoryId: string,
): Promise<WorkspaceConfig> {
  const rows = await db
    .select()
    .from(workspaceSettings)
    .where(eq(workspaceSettings.repositoryId, repositoryId))
    .limit(1);
  const s = rows[0];
  if (!s) return { labels: DEFAULT_STATUS_LABELS, autoCloseDone: true };
  return {
    labels: {
      planned: s.labelPlanned,
      "in-progress": s.labelInProgress,
      done: s.labelDone,
      backburner: s.labelBackburner,
    },
    autoCloseDone: s.autoCloseDone,
  };
}

export async function saveWorkspaceConfig(
  repositoryId: string,
  cfg: WorkspaceConfig,
): Promise<void> {
  const values = {
    labelPlanned: cfg.labels.planned,
    labelInProgress: cfg.labels["in-progress"],
    labelDone: cfg.labels.done,
    labelBackburner: cfg.labels.backburner,
    autoCloseDone: cfg.autoCloseDone,
    updatedAt: new Date(),
  };
  const existing = await db
    .select({ id: workspaceSettings.id })
    .from(workspaceSettings)
    .where(eq(workspaceSettings.repositoryId, repositoryId))
    .limit(1);
  if (existing[0]) {
    await db
      .update(workspaceSettings)
      .set(values)
      .where(eq(workspaceSettings.id, existing[0].id));
  } else {
    await db.insert(workspaceSettings).values({ repositoryId, ...values });
  }
}
