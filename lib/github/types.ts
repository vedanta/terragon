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
