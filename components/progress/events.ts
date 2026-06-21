export const PROGRESS_START_EVENT = "terragon:progress-start";
export const PROGRESS_DONE_EVENT = "terragon:progress-done";

/** Signal that an async op (refresh / mutation) has started. */
export function startProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROGRESS_START_EVENT));
  }
}

/** Signal that an async op has finished. Must be paired with {@link startProgress}. */
export function doneProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROGRESS_DONE_EVENT));
  }
}
