import { STATUS, type StatusKey } from "@/fixtures/seed";

export function StatusBadge({ status }: { status: StatusKey }) {
  const s = STATUS[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-fg">
      <span className="h-2 w-2 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}
