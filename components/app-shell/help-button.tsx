"use client";

import { openShortcutsHelp } from "@/components/help/events";

export function HelpButton() {
  return (
    <button
      type="button"
      onClick={() => openShortcutsHelp()}
      aria-label="Keyboard shortcuts"
      title="Keyboard shortcuts (?)"
      className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted hover:bg-hover"
    >
      ?
    </button>
  );
}
