"use client";

import { useEffect } from "react";
import { syncSystemTheme } from "@/lib/theme";

/** Keeps the resolved theme in step with the OS while in System mode. */
export function ThemeWatcher() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => syncSystemTheme();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return null;
}
