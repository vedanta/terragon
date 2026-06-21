"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast/toast";
import { openCommandPalette } from "@/components/command-palette/events";

/** Global shortcuts: `N` new, `G then B/G/M` nav, `/` open palette. (⌘K also opens it.) */
export function KeyboardShortcuts() {
  const router = useRouter();
  const { showToast } = useToast();
  const gPending = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();

      if (gPending.current) {
        gPending.current = false;
        if (k === "b") return nav(e, "/board");
        if (k === "g") return nav(e, "/grooming");
        if (k === "m") return nav(e, "/milestones");
      }
      if (k === "g") {
        gPending.current = true;
        if (gTimer.current) clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => {
          gPending.current = false;
        }, 1000);
        return;
      }
      if (k === "/") {
        e.preventDefault();
        openCommandPalette();
        return;
      }
      if (k === "n") {
        e.preventDefault();
        showToast("Create issue — coming soon");
      }
    }

    function nav(e: KeyboardEvent, path: string) {
      e.preventDefault();
      router.push(path);
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router, showToast]);

  return null;
}
