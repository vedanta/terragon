export const OPEN_HELP_EVENT = "terragon:open-help";

/** Open the keyboard-shortcuts help overlay from anywhere. */
export function openShortcutsHelp() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_HELP_EVENT));
  }
}
