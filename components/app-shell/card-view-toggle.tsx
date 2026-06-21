"use client";

import { useSyncExternalStore } from "react";

type View = "summary" | "detailed";

function subscribe(cb: () => void) {
  const o = new MutationObserver(cb);
  o.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-card-view"],
  });
  return () => o.disconnect();
}

function getSnapshot(): View {
  return document.documentElement.getAttribute("data-card-view") === "summary"
    ? "summary"
    : "detailed";
}

function getServerSnapshot(): View {
  return "detailed";
}

export function CardViewToggle() {
  const view = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const summary = view === "summary";

  function toggle() {
    const next: View = summary ? "detailed" : "summary";
    document.documentElement.setAttribute("data-card-view", next);
    try {
      localStorage.setItem("terragon-card-view", next);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={summary ? "Show detailed cards" : "Show summary cards"}
      title={summary ? "Detailed cards" : "Summary cards"}
      aria-pressed={summary}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted hover:bg-hover"
    >
      {summary ? "▭" : "≡"}
    </button>
  );
}
