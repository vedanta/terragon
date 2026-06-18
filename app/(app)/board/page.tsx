import { getIssues } from "@/lib/data";
import { BoardView } from "@/components/board/board-view";

export default function BoardPage() {
  const issues = getIssues();
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight text-fg">Board</h1>
        <p className="mt-0.5 text-[13px] text-fg-muted">
          acme/platform · execution surface
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <BoardView issues={issues} />
      </div>
    </div>
  );
}
