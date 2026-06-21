import { type DistributionSegment } from "@/lib/view/dashboard";

export function StatusBar({ segments }: { segments: DistributionSegment[] }) {
  const total = segments.reduce((n, s) => n + s.count, 0);

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-hover">
        {segments.map((s) =>
          s.count > 0 ? (
            <div
              key={s.key}
              title={`${s.label}: ${s.count}`}
              style={{
                width: `${(s.count / (total || 1)) * 100}%`,
                background: s.color,
              }}
            />
          ) : null,
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s) => (
          <span
            key={s.key}
            className="inline-flex items-center gap-1.5 text-[12px] text-fg-muted"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: s.color }}
            />
            {s.label} · {s.count}
          </span>
        ))}
      </div>
    </div>
  );
}
