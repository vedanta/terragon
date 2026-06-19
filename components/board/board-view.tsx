"use client";

import { useState } from "react";
import { groupBoardIssues, type BoardIssue } from "@/lib/view/board-issue";
import { BoardColumn } from "./board-column";
import { IssueDrawer } from "@/components/issue/issue-drawer";
import { EmptyState } from "@/components/states/empty-state";

export function BoardView({ issues }: { issues: BoardIssue[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  if (issues.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="No issues"
          subtitle="Nothing to show for this repository yet."
        />
      </div>
    );
  }

  const columns = groupBoardIssues(issues);
  const selectedIssue = issues.find((i) => i.number === selected) ?? null;

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
          />
        ))}
      </div>
      <IssueDrawer issue={selectedIssue} onClose={() => setSelected(null)} />
    </>
  );
}
