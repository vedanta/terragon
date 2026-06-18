import { DEMO_REPO } from "@/fixtures/seed";

export function RepositorySwitcher() {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-[13px] text-fg hover:bg-hover"
    >
      <span className="text-fg-subtle">repo</span>
      <span className="font-medium">{DEMO_REPO}</span>
      <span className="text-fg-subtle">▾</span>
    </button>
  );
}
