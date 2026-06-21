import { type MilestoneGroup } from "@/lib/view/board-issue";

export function MilestoneProgress({ groups }: { groups: MilestoneGroup[] }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow)]">
      <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-fg-subtle">
        Milestone progress
      </h2>
      {groups.length === 0 ? (
        <p className="text-[13px] text-fg-subtle">No milestones.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {groups.map((g) => {
            const pct = g.total ? Math.round((g.done / g.total) * 100) : 0;
            return (
              <li key={g.title} className="text-[13px]">
                <div className="mb-1 flex items-center justify-between">
                  <span className="truncate text-fg" title={g.title}>
                    {g.title}
                  </span>
                  <span className="shrink-0 text-[12px] text-fg-subtle">
                    {g.done}/{g.total}
                  </span>
                </div>
                <span className="block h-2 overflow-hidden rounded-full bg-hover">
                  <span
                    className="block h-full rounded-full bg-green"
                    style={{ width: `${pct}%` }}
                  />
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
