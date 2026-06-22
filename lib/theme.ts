import { useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_KEY = "terragon-theme";
/** Dispatched on the window whenever the mode changes (keeps controls in sync). */
export const THEME_EVENT = "terragon:theme";

export const THEME_MODES: ThemeMode[] = ["light", "dark", "system"];

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );
}

/** Resolve a mode to the concrete theme applied to `data-theme`. */
export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") return systemPrefersDark() ? "dark" : "light";
  return mode;
}

/** Read the persisted mode; defaults to "system" when unset or invalid. */
export function getStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(THEME_KEY);
  return THEME_MODES.includes(stored as ThemeMode)
    ? (stored as ThemeMode)
    : "system";
}

/** Apply a mode: set `data-theme` to the resolved theme, persist, and notify. */
export function applyThemeMode(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", resolveTheme(mode));
  try {
    window.localStorage.setItem(THEME_KEY, mode);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** Re-resolve `data-theme` for the current mode (used when the OS flips). */
export function syncSystemTheme(): void {
  if (typeof document === "undefined" || getStoredMode() !== "system") return;
  document.documentElement.setAttribute("data-theme", resolveTheme("system"));
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Reactive current mode for client controls. */
export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(subscribe, getStoredMode, () => "system");
}
