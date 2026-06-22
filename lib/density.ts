import { useSyncExternalStore } from "react";

export type Density = "comfortable" | "compact";

export const DENSITY_KEY = "terragon-density";
export const DENSITIES: Density[] = ["comfortable", "compact"];

/** Read the current density from the `data-density` attribute (set pre-paint). */
export function getStoredDensity(): Density {
  if (typeof document === "undefined") return "comfortable";
  return document.documentElement.getAttribute("data-density") === "compact"
    ? "compact"
    : "comfortable";
}

/** Apply a density: set `data-density` on <html> and persist it. */
export function applyDensity(density: Density): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-density", density);
  try {
    window.localStorage.setItem(DENSITY_KEY, density);
  } catch {
    /* ignore */
  }
}

function subscribe(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-density"],
  });
  return () => observer.disconnect();
}

/** Reactive current density for client controls. */
export function useDensity(): Density {
  return useSyncExternalStore(subscribe, getStoredDensity, () => "comfortable");
}
