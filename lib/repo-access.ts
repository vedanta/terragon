export interface RepoAccessInput {
  owner: string;
  ownerType: string;
  canWrite: boolean;
}

export interface RepoAccess {
  owned: boolean;
  readOnly: boolean;
  /** Relationship when not owned: "org" or "collaborator"; null when owned. */
  relation: "org" | "collaborator" | null;
}

/** Classify the viewer's relationship to a repo for badging. Pure. */
export function describeRepoAccess(
  repo: RepoAccessInput,
  viewerLogin: string,
): RepoAccess {
  const owned = repo.ownerType === "User" && repo.owner === viewerLogin;
  return {
    owned,
    readOnly: !repo.canWrite,
    relation: owned
      ? null
      : repo.ownerType === "Organization"
        ? "org"
        : "collaborator",
  };
}
