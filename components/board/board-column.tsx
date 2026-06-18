import { type Column } from "@/lib/board";
import { IssueCard } from "./issue-card";

export function BoardColumn({
  column,
  draggingId,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  column: Column;
  draggingId: number | null;
  onOpen: (n: number) => void;
  onDragStart: (n: number) => void;
  onDragEnd: () => void;
}) {
  return (
    <section className="flex w-72 shrink-0 flex-col rounded-xl bg-col">
      <header className="flex items-center gap-2 px-3 py-2.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: column.dot }}
        />
        <span className="text-[13px] font-semibold text-fg">
          {column.label}
        </span>
        <span className="ml-auto text-[12px] text-fg-subtle">
          {column.count}
        </span>
      </header>
      <div className="flex flex-col gap-2 px-2 pb-2">
        {column.issues.map((issue) => (
          <IssueCard
            key={issue.number}
            issue={issue}
            dragging={draggingId === issue.number}
            onOpen={() => onOpen(issue.number)}
            onDragStart={() => onDragStart(issue.number)}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </section>
  );
}
