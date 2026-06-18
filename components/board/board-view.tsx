"use client";

import { useState } from "react";
import { groupByStatus } from "@/lib/board";
import { type Issue } from "@/fixtures/seed";
import { BoardColumn } from "./board-column";
import { IssueDrawer } from "@/components/issue/issue-drawer";
import { EmptyState } from "@/components/states/empty-state";

export function BoardView({ issues }: { issues: Issue[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  if (issues.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="No issues yet"
          subtitle="Connect a repository to see issues here."
        />
      </div>
    );
  }

  const columns = groupByStatus(issues);
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
