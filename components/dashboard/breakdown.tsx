import { type BreakdownRow } from "@/lib/view/dashboard";

export function Breakdown({
  title,
  rows,
  empty = "Nothing to show.",
}: {
  title: string;
  rows: BreakdownRow[];
  empty?: string;
}) {
  const max = rows.reduce((m, r) => Math.max(m, r.count), 0) || 1;

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow)]">
      <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-fg-subtle">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="text-[13px] text-fg-subtle">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.key} className="flex items-center gap-3 text-[13px]">
              <span
                className="w-28 shrink-0 truncate text-fg-muted"
                title={r.label}
              >
                {r.label}
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-hover">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${(r.count / max) * 100}%`,
                    background: r.color,
                  }}
                />
              </span>
              <span className="w-6 shrink-0 text-right text-fg-subtle">
                {r.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
