import "server-only";
import { cache } from "react";
import { auth } from "@/auth";
import { getGithubToken } from "@/lib/github-token";
import { getCurrentRepo } from "@/lib/workspace";
import { getRepoMeta, getViewerLogin } from "@/lib/github-repos";
import { describeRepoAccess, type RepoAccess } from "@/lib/repo-access";

const USE_FIXTURES = process.env.USE_FIXTURES !== "false";

export interface ActiveRepoAccess extends RepoAccess {
  private: boolean;
}

async function loadActiveRepoAccess(): Promise<ActiveRepoAccess | null> {
  // Demo board: illustrative tags for the fixture repo (acme/platform).
  if (USE_FIXTURES) {
    return { owned: false, readOnly: false, relation: "org", private: false };
  }

  const session = await auth();
  if (!session?.user) return null;
  const repo = await getCurrentRepo(session.user.id);
  if (!repo) return null;
  const token = await getGithubToken(session.user.id);
  if (!token) return null;

  try {
    const [meta, viewerLogin] = await Promise.all([
      getRepoMeta(token, repo.owner, repo.name),
      getViewerLogin(token),
    ]);
    if (!meta) return null;
    const access = describeRepoAccess(
      { owner: repo.owner, ownerType: meta.ownerType, canWrite: meta.canWrite },
      viewerLogin,
    );
    return { ...access, private: meta.private };
  } catch {
    return null;
  }
}

/** Memoized per request so layout + switcher share one fetch. */
export const getActiveRepoAccess = cache(loadActiveRepoAccess);
