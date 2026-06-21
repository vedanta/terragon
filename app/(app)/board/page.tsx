import { Suspense } from "react";
import { getBoardData } from "@/lib/board-data";
import { getBoardMeta } from "@/lib/board-meta";
import { BoardView } from "@/components/board/board-view";
import { RefreshButton } from "@/components/refresh-button";
import { ErrorBanner } from "@/components/states/error-banner";
import { EmptyState } from "@/components/states/empty-state";
import { LoadingSkeleton } from "@/components/states/loading-skeleton";
import { ProgressBar } from "@/components/progress/progress-bar";

function Header({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-fg">Board</h1>
        <p className="mt-0.5 text-[13px] text-fg-muted">{subtitle}</p>
      </div>
      <RefreshButton />
    </div>
  );
}

/** Instant shell shown while live issues stream in. */
function BoardLoading() {
  return (
    <div className="flex h-full flex-col">
      <ProgressBar active />
      <Header subtitle="Loading issues from GitHub…" />
      <div className="min-h-0 flex-1 p-6">
        <LoadingSkeleton rows={6} />
      </div>
    </div>
  );
}

async function BoardContent() {
  const { issues, repo, error, source } = await getBoardData();
  const meta = await getBoardMeta();
  const subtitle =
    source === "fixtures"
      ? "acme/platform · execution surface"
      : repo
        ? `${repo} · execution surface`
        : "No repository selected";

  return (
    <div className="flex h-full flex-col">
      <Header subtitle={subtitle} />
      <div className="min-h-0 flex-1">
        {error ? (
          <div className="p-6">
            <ErrorBanner message={error} />
          </div>
        ) : source === "live" && !repo ? (
          <div className="p-6">
            <EmptyState
              title="No repository selected"
              subtitle="Pick a repository in Settings to load its issues."
            />
          </div>
        ) : (
          <BoardView issues={issues} live={source === "live"} meta={meta} />
        )}
      </div>
    </div>
  );
}

export default function BoardPage() {
  return (
    <Suspense fallback={<BoardLoading />}>
      <BoardContent />
    </Suspense>
  );
}
