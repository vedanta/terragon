import "server-only";
import { cache } from "react";
import { auth } from "@/auth";
import { getGithubToken } from "@/lib/github-token";
import { GitHubClient } from "@/lib/github/client";
import { getCurrentRepo } from "@/lib/workspace";
import { PEOPLE, LABELS, MILESTONES } from "@/fixtures/seed";

const USE_FIXTURES = process.env.USE_FIXTURES !== "false";

export interface DrawerMeta {
  editable: boolean;
  assignees: { login: string; name: string }[];
  labels: { name: string; color: string }[];
  milestones: { number: number; title: string }[];
}

function emptyMeta(): DrawerMeta {
  return { editable: false, assignees: [], labels: [], milestones: [] };
}

function withHash(color: string): string {
  return color.startsWith("#") ? color : `#${color}`;
}

async function loadBoardMeta(): Promise<DrawerMeta> {
  if (USE_FIXTURES) {
    return {
      editable: false,
      assignees: Object.entries(PEOPLE).map(([login, p]) => ({
        login,
        name: p.name,
      })),
      labels: Object.values(LABELS).map((l) => ({
        name: l.name,
        color: l.color,
      })),
      milestones: MILESTONES.map((title, i) => ({ number: i + 1, title })),
    };
  }

  const session = await auth();
  if (!session?.user) return emptyMeta();
  const repo = await getCurrentRepo(session.user.id);
  if (!repo) return emptyMeta();
  const token = await getGithubToken(session.user.id);
  if (!token) return emptyMeta();

  try {
    const client = new GitHubClient({ token });
    const m = await client.getRepoMetadata(repo.owner, repo.name);
    return {
      editable: true,
      assignees: m.assignees.map((a) => ({
        login: a.login,
        name: a.name ?? a.login,
      })),
      labels: m.labels.map((l) => ({ name: l.name, color: withHash(l.color) })),
      milestones: m.milestones,
    };
  } catch {
    return emptyMeta();
  }
}

export const getBoardMeta = cache(loadBoardMeta);
