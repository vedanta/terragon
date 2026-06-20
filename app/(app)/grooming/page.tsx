import { getBoardData } from "@/lib/board-data";
import { getBoardMeta } from "@/lib/board-meta";
import { GroomingTable } from "@/components/grooming/grooming-table";
import { RefreshButton } from "@/components/refresh-button";
import { ErrorBanner } from "@/components/states/error-banner";
import { EmptyState } from "@/components/states/empty-state";

export default async function GroomingPage() {
  const { issues, repo, error, source } = await getBoardData();
  const meta = await getBoardMeta();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-fg">
            Grooming
          </h1>
          <p className="mt-0.5 text-[13px] text-fg-muted">
            Backlog refinement · select rows to bulk edit
          </p>
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
          <GroomingTable issues={issues} meta={meta} />
        )}
      </div>
    </div>
  );
}
