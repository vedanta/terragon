export function PagePlaceholder({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="px-6 py-5">
      <h1 className="text-lg font-semibold tracking-tight text-fg">{title}</h1>
      <p className="mt-0.5 text-[13px] text-fg-muted">{subtitle}</p>
      <div className="mt-8 rounded-xl border border-dashed border-border-strong bg-surface p-10 text-center text-[13px] text-fg-subtle shadow-[var(--shadow)]">
        Coming in a later group.
      </div>
    </div>
  );
}
