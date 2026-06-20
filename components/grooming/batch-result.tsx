import { type BatchResult } from "@/lib/grooming/service";

export function BatchResultPanel({
  result,
  onDismiss,
}: {
  result: BatchResult;
  onDismiss: () => void;
}) {
  const total = result.updated.length + result.failed.length;
  const failed = result.failed.length;

  return (
    <div className="fixed bottom-20 left-1/2 z-30 w-[440px] max-w-[95vw] -translate-x-1/2 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-lg)]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-fg">
          {result.updated.length} of {total} updated
          {failed > 0 ? ` · ${failed} failed` : " · synced to GitHub"}
        </span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex h-6 w-6 items-center justify-center rounded-lg text-fg-muted hover:bg-hover"
        >
          ✕
        </button>
      </div>
      {failed > 0 && (
        <ul className="mt-2 max-h-40 overflow-auto text-[12px] text-fg-muted">
          {result.failed.map((f) => (
            <li key={f.number}>
              <span className="font-medium text-fg">#{f.number}</span>:{" "}
              {f.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
