export interface RawAssignee {
  login: string;
  name: string | null;
  avatarUrl: string;
}

/** A GitHub issue as Terragon consumes it (provider-shape normalized). */
export interface RawIssue {
  number: number;
  title: string;
  body: string;
  state: "open" | "closed";
  url: string;
  updatedAt: string;
  labels: string[];
  assignees: RawAssignee[];
  milestone: string | null;
}

export interface Page<T> {
  items: T[];
  endCursor: string | null;
  hasNextPage: boolean;
}

export interface RepoLabel {
  name: string;
  color: string;
}

export interface RepoMilestone {
  number: number;
  title: string;
}

export interface RepoAssignee {
  login: string;
  name: string | null;
  avatarUrl: string;
}

export interface RepoMetadata {
  labels: RepoLabel[];
  milestones: RepoMilestone[];
  assignees: RepoAssignee[];
}
