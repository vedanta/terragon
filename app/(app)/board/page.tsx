import { getBoardData } from "@/lib/board-data";
import { BoardView } from "@/components/board/board-view";
import { RefreshButton } from "@/components/refresh-button";
import { ErrorBanner } from "@/components/states/error-banner";
import { EmptyState } from "@/components/states/empty-state";

export default async function BoardPage() {
  const { issues, repo, error, source } = await getBoardData();
  const subtitle =
    source === "fixtures"
      ? "acme/platform · execution surface"
      : repo
        ? `${repo} · execution surface`
        : "No repository selected";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-fg">
            Board
          </h1>
          <p className="mt-0.5 text-[13px] text-fg-muted">{subtitle}</p>
        </div>
        <RefreshButton />
      </div>
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
          <BoardView issues={issues} />
        )}
      </div>
    </div>
  );
}
