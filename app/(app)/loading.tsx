import { LoadingSkeleton } from "@/components/states/loading-skeleton";

export default function Loading() {
  return (
    <div className="p-6">
      <LoadingSkeleton rows={6} />
    </div>
  );
}
