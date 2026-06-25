export const OPEN_CREATE_EVENT = "terragon:open-create";

/** Open the new-issue modal from anywhere (N key, palette, top-bar button). */
export function openCreateIssue() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_CREATE_EVENT));
  }
}
