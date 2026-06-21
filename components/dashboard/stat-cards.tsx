import { type DashboardStats } from "@/lib/view/dashboard";

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-[var(--shadow)]">
      <div
        className={
          "text-2xl font-semibold tracking-tight " +
          (accent ? "text-accent-fg" : "text-fg")
        }
      >
        {value}
      </div>
      <div className="mt-0.5 text-[12px] text-fg-subtle">{label}</div>
    </div>
  );
}

export function StatCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Stat label="Open" value={stats.open} />
      <Stat label="In Progress" value={stats.inProgress} accent />
      <Stat label="Done" value={stats.done} />
      <Stat label="Backburner" value={stats.backburner} />
      <Stat label="Unassigned" value={stats.unassigned} />
    </div>
  );
}
