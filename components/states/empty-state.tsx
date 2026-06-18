export function EmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border-strong bg-surface p-10 text-center shadow-[var(--shadow)]">
      <p className="text-[14px] font-medium text-fg">{title}</p>
      {subtitle && (
        <p className="mt-1 text-[13px] text-fg-subtle">{subtitle}</p>
      )}
    </div>
  );
}
