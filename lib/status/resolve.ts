import { type StatusKey } from "@/fixtures/seed";

/** Label names that map to each status (defaults + any mapped legacy labels). */
export interface LabelMapping {
  planned: string[];
  "in-progress": string[];
  done: string[];
  backburner: string[];
}

export const DEFAULT_LABEL_MAPPING: LabelMapping = {
  planned: ["terragon/planned"],
  "in-progress": ["terragon/in-progress"],
  done: ["terragon/done"],
  backburner: ["terragon/backburner"],
};

// Precedence when an issue carries multiple status labels (locked decision).
const PRECEDENCE: StatusKey[] = [
  "in-progress",
  "planned",
  "backburner",
  "done",
];

export interface ResolvableIssue {
  state: "open" | "closed";
  labels: string[];
}

/**
 * Resolve an issue's board status (architecture §6):
 *  - closed                       → done
 *  - exactly one terragon/* label → that status
 *  - multiple                     → precedence in-progress > planned > backburner > done
 *  - none, but a mapped label hits → that status
 *  - otherwise                    → planned (default)
 */
export function resolveStatus(
  issue: ResolvableIssue,
  mapping: LabelMapping = DEFAULT_LABEL_MAPPING,
): StatusKey {
  if (issue.state === "closed") return "done";

  const present = new Set<StatusKey>();
  for (const label of issue.labels) {
    for (const status of PRECEDENCE) {
      if (mapping[status].includes(label)) present.add(status);
    }
  }

  if (present.size === 0) return "planned";
  if (present.size === 1) return [...present][0];
  return PRECEDENCE.find((s) => present.has(s)) ?? "planned";
}
