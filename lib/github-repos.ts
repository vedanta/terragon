import "server-only";

export interface GitHubRepo {
  id: number;
  fullName: string;
  owner: string;
  name: string;
  private: boolean;
  defaultBranch: string;
  /** "User" (personal) or "Organization". */
  ownerType: string;
  /** Viewer has push access (can write labels/issues). */
  canWrite: boolean;
}

/** The authenticated user's GitHub login (for ownership detection). */
export async function getViewerLogin(token: string): Promise<string> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub /user failed: ${res.status}`);
  const json = (await res.json()) as { login: string };
  return json.login;
}

/**
 * List the authenticated user's repositories via the GitHub REST API.
 * Plain fetch for now — the typed GitHub Client spine arrives in G4.
 */
export async function listUserRepos(token: string): Promise<GitHubRepo[]> {
  const res = await fetch(
    "https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      // Always fetch fresh; this is per-user data behind auth.
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(`GitHub /user/repos failed: ${res.status}`);
  }

  const json = (await res.json()) as Array<{
    id: number;
    full_name: string;
    name: string;
    owner: { login: string; type: string };
    private: boolean;
    default_branch: string;
    permissions?: { admin?: boolean; maintain?: boolean; push?: boolean };
  }>;

  return json.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    owner: r.owner.login,
    name: r.name,
    private: r.private,
    defaultBranch: r.default_branch,
    ownerType: r.owner.type,
    canWrite: Boolean(
      r.permissions?.push || r.permissions?.maintain || r.permissions?.admin,
    ),
  }));
}
