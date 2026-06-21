"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { groupBoardIssues, type BoardIssue } from "@/lib/view/board-issue";
import {
  applyBoardFilter,
  deriveFilterOptions,
  EMPTY_FILTER,
  type BoardFilter,
} from "@/lib/view/board-filter";
import {
  sortBoardIssues,
  DEFAULT_SORT,
  type SortKey,
} from "@/lib/view/board-sort";
import { useProgress } from "@/components/progress/use-progress";
import { STATUS, type StatusKey } from "@/fixtures/seed";
import { BoardColumn } from "./board-column";
import { BoardFilters } from "./board-filters";
import { IssueDrawer } from "@/components/issue/issue-drawer";
import { EmptyState } from "@/components/states/empty-state";
import { useToast } from "@/components/toast/toast";
import { moveIssue } from "@/app/(app)/board/actions";
import { type DrawerMeta } from "@/lib/board-meta";

export function BoardView({
  issues,
  live,
  meta,
}: {
  issues: BoardIssue[];
  live: boolean;
  meta: DrawerMeta;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [filter, setFilter] = useState<BoardFilter>(EMPTY_FILTER);
  const [sort, setSort] = useState<SortKey>(DEFAULT_SORT);
  const [isPending, startTransition] = useTransition();
  useProgress(isPending);
  const { showToast } = useToast();
  const [optimistic, applyOptimistic] = useOptimistic(
    issues,
    (state: BoardIssue[], m: { number: number; status: StatusKey }) =>
      state.map((i) =>
        i.number === m.number ? { ...i, status: m.status } : i,
      ),
  );

  function dropTo(target: StatusKey) {
    const number = dragging;
    setDragging(null);
    if (number == null) return;
    const issue = optimistic.find((i) => i.number === number);
    if (!issue || issue.status === target) return;
    if (!live) {
      showToast("Connect a repository to move issues");
      return;
    }
    const current = issue.status;
    startTransition(async () => {
      applyOptimistic({ number, status: target });
      const res = await moveIssue(number, current, target);
      if (!res.ok) showToast(res.error ?? `Couldn't move #${number}`);
      else showToast(`#${number} moved to ${STATUS[target].label}`);
    });
  }

  // Options come from the full set so they don't vanish as filters narrow it.
  // Hooks must run before any early return, so compute this up top.
  const options = useMemo(() => deriveFilterOptions(issues), [issues]);

  if (optimistic.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="No issues"
          subtitle="Nothing to show for this repository yet."
        />
      </div>
    );
  }

  const filtered = applyBoardFilter(optimistic, filter);
  const columns = groupBoardIssues(sortBoardIssues(filtered, sort));
  const selectedIssue = optimistic.find((i) => i.number === selected) ?? null;

  return (
    <>
      <div className="flex h-full flex-col">
        <BoardFilters
          options={options}
          filter={filter}
          onChange={setFilter}
          sort={sort}
          onSortChange={setSort}
          shown={filtered.length}
          total={optimistic.length}
        />
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No matching issues"
              subtitle="No issues match the current filters."
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto p-4">
            {columns.map((col) => (
              <BoardColumn
                key={col.key}
                column={col}
                draggingId={dragging}
                onOpen={setSelected}
                onDragStart={setDragging}
                onDragEnd={() => setDragging(null)}
                onDrop={() => dropTo(col.key)}
              />
            ))}
          </div>
        )}
      </div>
      <IssueDrawer
        issue={selectedIssue}
        onClose={() => setSelected(null)}
        meta={meta}
      />
    </>
  );
}
