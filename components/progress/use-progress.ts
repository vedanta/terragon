"use client";

import { useEffect } from "react";
import { startProgress, doneProgress } from "./events";

/**
 * Drive the top progress bar from a boolean (e.g. a `useTransition` pending
 * flag). Fires a balanced start/done so concurrent ops nest correctly.
 */
export function useProgress(active: boolean) {
  useEffect(() => {
    if (!active) return;
    startProgress();
    return () => doneProgress();
  }, [active]);
}
