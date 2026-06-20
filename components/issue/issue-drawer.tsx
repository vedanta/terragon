"use client";

import { useEffect, useTransition } from "react";
import { type BoardIssue } from "@/lib/view/board-issue";
import { type DrawerMeta } from "@/lib/board-meta";
import { STATUS, STATUS_ORDER, type StatusKey } from "@/fixtures/seed";
import { Avatar } from "@/components/ui/avatar";
import { LabelChip } from "@/components/ui/label-chip";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/toast/toast";
import { moveIssue } from "@/app/(app)/board/actions";
import {
  saveIssueText,
  setAssignee,
  setMilestone,
  addLabel,
  removeLabel,
  type EditResult,
} from "@/app/(app)/board/issue-actions";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-20 shrink-0 pt-1.5 text-[12px] text-fg-subtle">
        {label}
      </span>
      <div className="min-w-0 flex-1 text-[13px] text-fg">{children}</div>
    </div>
  );
}

const selectClass =
  "rounded-lg border border-border bg-bg px-2 py-1 text-[13px] text-fg focus:outline-none focus:ring-2 focus:ring-accent-soft";

function DrawerContent({
  issue,
  meta,
}: {
  issue: BoardIssue;
  meta: DrawerMeta;
}) {
  const [, start] = useTransition();
  const { showToast } = useToast();

  function run(fn: () => Promise<EditResult>, okMsg?: string) {
    start(async () => {
      const r = await fn();
      if (!r.ok) showToast(r.error ?? "Update failed");
      else if (okMsg) showToast(okMsg);
    });
  }

  const editable = meta.editable;
  const currentMilestone =
    meta.milestones.find((m) => m.title === issue.milestone)?.number ?? "";
  const labelNames = new Set(issue.labels.map((l) => l.name));
  const addable = meta.labels.filter((l) => !labelNames.has(l.name));

  return (
    <>
      <h2 className="text-[17px] font-semibold leading-snug tracking-tight text-fg">
        {issue.title || "Untitled issue"}
      </h2>

      <div className="flex flex-col gap-3 border-y border-border py-4">
        <Field label="Status">
          {editable ? (
            <select
              className={selectClass}
              defaultValue={issue.status}
              onChange={(e) =>
                run(() =>
                  moveIssue(
                    issue.number,
                    issue.status,
                    e.target.value as StatusKey,
                  ),
                )
              }
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS[s].label}
                </option>
              ))}
            </select>
          ) : (
            <StatusBadge status={issue.status} />
          )}
        </Field>

        <Field label="Assignee">
          {editable ? (
            <select
              className={selectClass}
              defaultValue={issue.assigneeLogin ?? ""}
              onChange={(e) =>
                run(() => setAssignee(issue.number, e.target.value || null))
              }
            >
              <option value="">Unassigned</option>
              {meta.assignees.map((a) => (
                <option key={a.login} value={a.login}>
                  {a.name}
                </option>
              ))}
            </select>
          ) : issue.assignee ? (
            <span className="inline-flex items-center gap-2">
              <Avatar person={issue.assignee} size={18} />
              {issue.assignee.name}
            </span>
          ) : (
            <span className="text-fg-subtle">Unassigned</span>
          )}
        </Field>

        <Field label="Milestone">
          {editable ? (
            <select
              className={selectClass}
              defaultValue={currentMilestone}
              onChange={(e) =>
                run(() =>
                  setMilestone(
                    issue.number,
                    e.target.value ? Number(e.target.value) : null,
                  ),
                )
              }
            >
              <option value="">None</option>
              {meta.milestones.map((m) => (
                <option key={m.number} value={m.number}>
                  {m.title}
                </option>
              ))}
            </select>
          ) : (
            (issue.milestone ?? <span className="text-fg-subtle">None</span>)
          )}
        </Field>

        <Field label="Labels">
          <div className="flex flex-wrap items-center gap-1.5">
            {issue.labels.map((l) => (
              <span key={l.name} className="inline-flex items-center gap-1">
                <LabelChip label={l} />
                {editable && (
                  <button
                    type="button"
                    aria-label={`Remove ${l.name}`}
                    onClick={() => run(() => removeLabel(issue.number, l.name))}
                    className="text-fg-subtle hover:text-fg"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            {!issue.labels.length && !editable && (
              <span className="text-fg-subtle">None</span>
            )}
            {editable && addable.length > 0 && (
              <select
                className={selectClass}
                value=""
                onChange={(e) => {
                  if (e.target.value)
                    run(() => addLabel(issue.number, e.target.value));
                }}
              >
                <option value="">+ Add label</option>
                {addable.map((l) => (
                  <option key={l.name} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </Field>

        <Field label="Updated">
          <span className="text-fg-muted">{issue.updated}</span>
        </Field>
      </div>

      <div>
        <h3 className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-fg-subtle">
          Description
        </h3>
        {editable ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const title = String(fd.get("title") ?? "");
              const body = String(fd.get("body") ?? "");
              if (title === issue.title && body === issue.description) {
                showToast("No changes");
                return;
              }
              run(() => saveIssueText(issue.number, title, body), "Saved");
            }}
            className="flex flex-col gap-2"
          >
            <input
              name="title"
              defaultValue={issue.title}
              aria-label="Title"
              className="rounded-lg border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg focus:outline-none focus:ring-2 focus:ring-accent-soft"
            />
            <textarea
              name="body"
              defaultValue={issue.description}
              rows={6}
              aria-label="Description"
              className="resize-y rounded-lg border border-border bg-bg px-2.5 py-1.5 text-[13px] leading-relaxed text-fg focus:outline-none focus:ring-2 focus:ring-accent-soft"
            />
            <button
              type="submit"
              className="self-start rounded-lg bg-accent px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90"
            >
              Save
            </button>
          </form>
        ) : (
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-fg-muted">
            {issue.description || "No description."}
          </p>
        )}
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
    </>
  );
}

export function IssueDrawer({
  issue,
  onClose,
  meta,
}: {
  issue: BoardIssue | null;
  onClose: () => void;
  meta: DrawerMeta;
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
        <DrawerContent key={issue.number} issue={issue} meta={meta} />
      </aside>
    </div>
  );
}
