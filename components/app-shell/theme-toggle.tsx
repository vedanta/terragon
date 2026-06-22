"use client";

import { applyThemeMode, resolveTheme, useThemeMode } from "@/lib/theme";

export function ThemeToggle() {
  const resolved = resolveTheme(useThemeMode());

  return (
    <button
      type="button"
      onClick={() => applyThemeMode(resolved === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
      className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted hover:bg-hover"
    >
      {resolved === "light" ? "◐" : "◑"}
    </button>
  );
}
