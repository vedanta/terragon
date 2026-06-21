"use client";

import { openCommandPalette } from "@/components/command-palette/events";

/** A search-styled button that opens the command palette. */
export function SearchTrigger() {
  return (
    <button
      type="button"
      onClick={() => openCommandPalette()}
      aria-label="Search issues"
      className="flex h-8 w-64 items-center gap-2 rounded-lg border border-border bg-bg px-3 text-[13px] text-fg-subtle hover:bg-hover"
    >
      <span className="flex-1 text-left">Search…</span>
      <kbd className="rounded border border-border px-1.5 py-0.5 text-[11px] font-medium text-fg-subtle">
        ⌘K
      </kbd>
    </button>
  );
}
