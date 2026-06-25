import "server-only";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { syncEvents } from "@/db/schema";
import { getCurrentRepo } from "@/lib/workspace";
import { describeActivity, type ActivityItem } from "@/lib/activity-format";

export type { ActivityItem };

/** Recent sync events for the active repository (newest first). */
export async function getRecentActivity(limit = 50): Promise<ActivityItem[]> {
  const session = await auth();
  if (!session?.user) return [];
  const repo = await getCurrentRepo(session.user.id);
  if (!repo) return [];

  const rows = await db
    .select()
    .from(syncEvents)
    .where(eq(syncEvents.repositoryId, repo.id))
    .orderBy(desc(syncEvents.createdAt))
    .limit(limit);

  return rows.map((r) => {
    const { title, detail } = describeActivity(r.eventType, r.payload);
    return {
      id: r.id,
      type: r.eventType,
      status: r.status,
      title,
      detail,
      error: r.errorMessage,
      at: r.createdAt.toISOString(),
    };
  });
}
