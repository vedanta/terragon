import { LoadingSkeleton } from "@/components/states/loading-skeleton";
import { ProgressBar } from "@/components/progress/progress-bar";

export default function Loading() {
  return (
    <div className="p-6">
      <ProgressBar active />
      <p className="mb-3 text-[13px] text-fg-muted">Loading…</p>
      <LoadingSkeleton rows={6} />
    </div>
  );
}
