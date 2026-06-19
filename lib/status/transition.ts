import { type StatusKey } from "@/fixtures/seed";

export interface StatusLabels {
  planned: string;
  "in-progress": string;
  done: string;
  backburner: string;
}

export const DEFAULT_STATUS_LABELS: StatusLabels = {
  planned: "terragon/planned",
  "in-progress": "terragon/in-progress",
  done: "terragon/done",
  backburner: "terragon/backburner",
};

export interface TransitionPlan {
  /** Apply this label first (never leave an issue statusless). */
  addLabel: string;
  /** Then remove these. */
  removeLabels: string[];
  close: boolean;
  reopen: boolean;
}

/**
 * Plan the GitHub mutations for a status change (architecture §6/§7):
 * add-then-remove ordering; close on → Done and reopen on ← Done when
 * `autoCloseDone` is enabled.
 */
export function transitionPlan(
  current: StatusKey,
  target: StatusKey,
  opts: { autoCloseDone: boolean },
  labels: StatusLabels = DEFAULT_STATUS_LABELS,
): TransitionPlan {
  const addLabel = labels[target];
  const removeLabels = Object.values(labels).filter((l) => l !== addLabel);
  return {
    addLabel,
    removeLabels,
    close: target === "done" && opts.autoCloseDone,
    reopen: current === "done" && target !== "done" && opts.autoCloseDone,
  };
}
