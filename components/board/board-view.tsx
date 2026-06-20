"use client";

import { useOptimistic, useState, useTransition } from "react";
import { groupBoardIssues, type BoardIssue } from "@/lib/view/board-issue";
import { STATUS, type StatusKey } from "@/fixtures/seed";
import { BoardColumn } from "./board-column";
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
  const [, startTransition] = useTransition();
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

  const columns = groupBoardIssues(optimistic);
  const selectedIssue = optimistic.find((i) => i.number === selected) ?? null;

  return (
    <>
      <div className="flex h-full gap-3 overflow-x-auto p-4">
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
      <IssueDrawer
        issue={selectedIssue}
        onClose={() => setSelected(null)}
        meta={meta}
      />
    </>
  );
}
