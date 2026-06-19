"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [spinning, setSpinning] = useState(false);

  function refresh() {
    setSpinning(true);
    startTransition(() => {
      router.refresh();
      setTimeout(() => setSpinning(false), 400);
    });
  }

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={isPending}
      className="rounded-lg border border-border px-2.5 py-1.5 text-[13px] text-fg-muted hover:bg-hover disabled:opacity-60"
    >
      {spinning ? "Refreshing…" : "Refresh"}
    </button>
  );
}
