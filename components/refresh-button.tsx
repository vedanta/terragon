"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useProgress } from "@/components/progress/use-progress";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  useProgress(isPending);

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={isPending}
      className="rounded-lg border border-border px-2.5 py-1.5 text-[13px] text-fg-muted hover:bg-hover disabled:opacity-60"
    >
      {isPending ? "Refreshing…" : "Refresh"}
    </button>
  );
}
