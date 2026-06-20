import { type BoardIssue } from "@/lib/view/board-issue";
import { STATUS } from "@/fixtures/seed";
import { Avatar } from "@/components/ui/avatar";
import { LabelChip } from "@/components/ui/label-chip";

export function IssueList({ issues }: { issues: BoardIssue[] }) {
  if (issues.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-strong px-4 py-6 text-center text-[13px] text-fg-subtle">
        Nothing here.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
      {issues.map((i) => (
        <li key={i.number}>
          <a
            href={i.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2 text-[13px] hover:bg-hover"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: STATUS[i.status].dot }}
            />
            <span className="shrink-0 text-fg-subtle">#{i.number}</span>
            <span className="min-w-0 flex-1 truncate text-fg">
              {i.title || "Untitled issue"}
            </span>
            <span className="hidden shrink-0 gap-1 sm:flex">
              {i.labels.slice(0, 3).map((l) => (
                <LabelChip key={l.name} label={l} />
              ))}
            </span>
            {i.assignee && <Avatar person={i.assignee} size={18} />}
          </a>
        </li>
      ))}
    </ul>
  );
}
