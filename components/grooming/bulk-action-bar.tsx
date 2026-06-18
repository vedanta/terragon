import { STATUS_ORDER, STATUS, PEOPLE } from "@/fixtures/seed";

const selectClass =
  "rounded-lg border border-border bg-bg px-2 py-1 text-[13px] text-fg focus:outline-none focus:ring-2 focus:ring-accent-soft";

export function BulkActionBar({
  count,
  onApply,
  onClear,
}: {
  count: number;
  onApply: () => void;
  onClear: () => void;
}) {
  return (
    <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-[var(--shadow-lg)]">
      <span className="text-[13px] font-medium text-fg">{count} selected</span>
      <select aria-label="Set status" defaultValue="" className={selectClass}>
        <option value="" disabled>
          Status…
        </option>
        {STATUS_ORDER.map((k) => (
          <option key={k}>{STATUS[k].label}</option>
        ))}
      </select>
      <select aria-label="Set assignee" defaultValue="" className={selectClass}>
        <option value="" disabled>
          Assignee…
        </option>
        {Object.entries(PEOPLE).map(([k, p]) => (
          <option key={k}>{p.name}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={onApply}
        className="rounded-lg bg-accent px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90"
      >
        Apply
      </button>
      <button
        type="button"
        onClick={onClear}
        className="text-[13px] text-fg-muted hover:text-fg"
      >
        Clear
      </button>
    </div>
  );
}
