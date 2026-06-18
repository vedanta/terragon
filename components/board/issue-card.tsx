import { PEOPLE, LABELS, type Issue } from "@/fixtures/seed";
import { Avatar } from "@/components/ui/avatar";
import { LabelChip } from "@/components/ui/label-chip";

export function IssueCard({
  issue,
  dragging,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  issue: Issue;
  dragging: boolean;
  onOpen: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const person = issue.assignee ? PEOPLE[issue.assignee] : null;

  return (
    <button
      type="button"
      draggable
      onClick={onOpen}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{ opacity: dragging ? 0.4 : 1 }}
      className="flex w-full cursor-grab flex-col gap-2 rounded-lg border border-border bg-surface p-3 text-left shadow-[var(--shadow)] hover:border-border-strong active:cursor-grabbing"
    >
      <span className="text-[12px] text-fg-subtle">#{issue.number}</span>
      <span className="text-[13.5px] font-medium leading-snug text-fg">
        {issue.title || "Untitled issue"}
      </span>
      {issue.labels.length > 0 && (
        <span className="flex flex-wrap gap-1.5">
          {issue.labels.map((l) => (
            <LabelChip key={l} label={LABELS[l]} />
          ))}
        </span>
      )}
      <span className="mt-0.5 flex items-center gap-2 text-[12px] text-fg-muted">
        {person ? (
          <Avatar person={person} size={18} />
        ) : (
          <span className="text-fg-subtle">Unassigned</span>
        )}
        {issue.milestone && <span className="truncate">{issue.milestone}</span>}
      </span>
    </button>
  );
}
