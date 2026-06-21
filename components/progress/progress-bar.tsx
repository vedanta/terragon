"use client";

import { useEffect, useRef, useState } from "react";
import { PROGRESS_START_EVENT, PROGRESS_DONE_EVENT } from "./events";

/**
 * Thin indeterminate accent bar pinned to the top of the viewport.
 *
 * - `active` (forced) — always shown; use as a Suspense / route-loading fallback.
 * - Otherwise event-driven: counts start/done signals and shows while any are
 *   in flight. GitHub fetches give no progress events, so it's indeterminate.
 */
export function ProgressBar({ active: forced = false }: { active?: boolean }) {
  const [active, setActive] = useState(false);
  const count = useRef(0);

  useEffect(() => {
    if (forced) return;
    const onStart = () => {
      count.current += 1;
      setActive(true);
    };
    const onDone = () => {
      count.current = Math.max(0, count.current - 1);
      if (count.current === 0) setActive(false);
    };
    window.addEventListener(PROGRESS_START_EVENT, onStart);
    window.addEventListener(PROGRESS_DONE_EVENT, onDone);
    return () => {
      window.removeEventListener(PROGRESS_START_EVENT, onStart);
      window.removeEventListener(PROGRESS_DONE_EVENT, onDone);
    };
  }, [forced]);

  if (!forced && !active) return null;

  return (
    <div
      className="progress-bar"
      role="progressbar"
      aria-busy="true"
      aria-label="Loading"
    />
  );
}
