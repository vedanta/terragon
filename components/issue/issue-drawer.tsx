"use client";

import { useEffect } from "react";
import { type BoardIssue } from "@/lib/view/board-issue";
import { Avatar } from "@/components/ui/avatar";
import { LabelChip } from "@/components/ui/label-chip";
import { StatusBadge } from "@/components/ui/status-badge";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-20 shrink-0 pt-0.5 text-[12px] text-fg-subtle">
        {label}
      </span>
      <div className="min-w-0 flex-1 text-[13px] text-fg">{children}</div>
    </div>
  );
}

export function IssueDrawer({
  issue,
  onClose,
}: {
  issue: BoardIssue | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!issue) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [issue, onClose]);

  if (!issue) return null;

  const person = issue.assignee;

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0"
        style={{ background: "var(--overlay)" }}
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label={`Issue #${issue.number}`}
        className="absolute right-0 top-0 flex h-full w-[440px] max-w-[90vw] flex-col gap-5 overflow-auto border-l border-border bg-surface p-5 shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-fg-subtle">#{issue.number}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-fg-muted hover:bg-hover"
          >
            ✕
          </button>
        </div>

        <h2 className="text-[17px] font-semibold leading-snug tracking-tight text-fg">
          {issue.title || "Untitled issue"}
        </h2>

        <div className="flex flex-col gap-3 border-y border-border py-4">
          <Field label="Status">
            <StatusBadge status={issue.status} />
          </Field>
          <Field label="Assignee">
            {person ? (
              <span className="inline-flex items-center gap-2">
                <Avatar person={person} size={18} />
                {person.name}
              </span>
            ) : (
              <span className="text-fg-subtle">Unassigned</span>
            )}
          </Field>
          <Field label="Labels">
            {issue.labels.length ? (
              <span className="flex flex-wrap gap-1.5">
                {issue.labels.map((l) => (
                  <LabelChip key={l.name} label={l} />
                ))}
              </span>
            ) : (
              <span className="text-fg-subtle">None</span>
            )}
          </Field>
          <Field label="Milestone">
            {issue.milestone ?? <span className="text-fg-subtle">None</span>}
          </Field>
          <Field label="Updated">
            <span className="text-fg-muted">{issue.updated}</span>
          </Field>
        </div>

        <div>
          <h3 className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-fg-subtle">
            Description
          </h3>
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-fg-muted">
            {issue.description || "No description."}
          </p>
        </div>

        {issue.comments.length > 0 && (
          <div>
            <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-fg-subtle">
              Comments
            </h3>
            <div className="flex flex-col gap-3">
              {issue.comments.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <span
                    className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    style={{ background: c.color }}
                  >
                    {c.initials}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px]">
                      <span className="font-medium text-fg">{c.author}</span>{" "}
                      <span className="text-fg-subtle">{c.time}</span>
                    </div>
                    <p className="text-[13px] text-fg-muted">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {issue.activity.length > 0 && (
          <div>
            <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-fg-subtle">
              Activity
            </h3>
            <ul className="flex flex-col gap-1 text-[12px] text-fg-subtle">
              {issue.activity.map((a, i) => (
                <li key={i}>
                  {a.text} · {a.time}
                </li>
              ))}
            </ul>
          </div>
        )}

        <a
          href={issue.url}
          target="_blank"
          rel="noreferrer"
          className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] text-fg hover:bg-hover"
        >
          Open in GitHub ↗
        </a>
      </aside>
    </div>
  );
}
