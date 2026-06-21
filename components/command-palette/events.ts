export const OPEN_PALETTE_EVENT = "terragon:open-palette";

/** Open the command palette from anywhere (top-bar search, shortcuts). */
export function openCommandPalette() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
  }
}
