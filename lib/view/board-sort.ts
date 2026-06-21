import type { BoardIssue } from "./board-issue";

export type SortKey = "updated" | "number" | "title";

export const DEFAULT_SORT: SortKey = "updated";

export const SORTS: { key: SortKey; label: string }[] = [
  { key: "updated", label: "Updated" },
  { key: "number", label: "Issue number" },
  { key: "title", label: "Title (A–Z)" },
];

/** Sort a copy of the issues by the given key (status grouping is applied after). */
export function sortBoardIssues(
  issues: BoardIssue[],
  key: SortKey,
): BoardIssue[] {
  const out = [...issues];
  switch (key) {
    case "number":
      out.sort((a, b) => a.number - b.number);
      break;
    case "title":
      out.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "updated":
    default:
      out.sort((a, b) => b.updatedRank - a.updatedRank);
      break;
  }
  return out;
}
