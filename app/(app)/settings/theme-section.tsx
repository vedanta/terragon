"use client";

import { applyThemeMode, useThemeMode, type ThemeMode } from "@/lib/theme";

const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: "light", label: "Light" },
  { mode: "system", label: "System" },
  { mode: "dark", label: "Dark" },
];

export function ThemeSection() {
  const mode = useThemeMode();

  return (
    <div className="mt-8 max-w-2xl">
      <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-fg-subtle">
        Appearance
      </h2>
      <div className="inline-flex gap-1 rounded-xl border border-border p-1">
        {OPTIONS.map((o) => {
          const active = mode === o.mode;
          return (
            <button
              key={o.mode}
              type="button"
              onClick={() => applyThemeMode(o.mode)}
              aria-pressed={active}
              className={`rounded-lg px-3 py-1.5 text-[13px] ${
                active
                  ? "bg-accent-soft font-medium text-accent-fg"
                  : "text-fg-muted hover:bg-hover"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[12px] text-fg-subtle">
        System follows your operating system’s appearance.
      </p>
    </div>
  );
}
