import { type Label } from "@/fixtures/seed";

export function LabelChip({ label }: { label: Label }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-hover px-2 py-0.5 text-[11px] text-fg-muted">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: label.color }}
      />
      {label.name}
    </span>
  );
}
