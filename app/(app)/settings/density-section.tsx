"use client";

import { applyDensity, useDensity, type Density } from "@/lib/density";

const OPTIONS: { density: Density; label: string }[] = [
  { density: "comfortable", label: "Comfortable" },
  { density: "compact", label: "Compact" },
];

export function DensitySection() {
  const density = useDensity();

  return (
    <div className="mt-8 max-w-2xl">
      <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-fg-subtle">
        Density
      </h2>
      <div className="inline-flex gap-1 rounded-xl border border-border p-1">
        {OPTIONS.map((o) => {
          const active = density === o.density;
          return (
            <button
              key={o.density}
              type="button"
              onClick={() => applyDensity(o.density)}
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
        Compact tightens board cards to fit more on screen.
      </p>
    </div>
  );
}
