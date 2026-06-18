import { getIssues } from "@/lib/data";
import { GroomingTable } from "@/components/grooming/grooming-table";

export default function GroomingPage() {
  const issues = getIssues();
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight text-fg">
          Grooming
        </h1>
        <p className="mt-0.5 text-[13px] text-fg-muted">
          Backlog refinement · select rows to bulk edit
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <GroomingTable issues={issues} />
      </div>
    </div>
  );
}
