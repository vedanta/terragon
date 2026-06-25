"use client";

import { useEffect, useState, useTransition } from "react";
import { STATUS, STATUS_ORDER, type StatusKey } from "@/fixtures/seed";
import { type DrawerMeta } from "@/lib/board-meta";
import { createIssue } from "@/app/(app)/board/actions";
import { useToast } from "@/components/toast/toast";
import { useProgress } from "@/components/progress/use-progress";
import { OPEN_CREATE_EVENT } from "./events";

const fieldClass =
  "w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg focus:outline-none focus:ring-2 focus:ring-accent-soft";

export function CreateIssueModal({
  meta,
  live,
}: {
  meta: DrawerMeta;
  live: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<StatusKey>("planned");
  const [assignee, setAssignee] = useState("");
  const [milestone, setMilestone] = useState("");
  const [labels, setLabels] = useState<Set<string>>(new Set());
  const [isPending, start] = useTransition();
  useProgress(isPending);
  const { showToast } = useToast();

  function reset() {
    setTitle("");
    setBody("");
    setStatus("planned");
    setAssignee("");
    setMilestone("");
    setLabels(new Set());
  }

  function close() {
    setOpen(false);
    reset();
  }

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener(OPEN_CREATE_EVENT, onOpen);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_CREATE_EVENT, onOpen);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function toggleLabel(name: string) {
    setLabels((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Title is required");
      return;
    }
    if (!live) {
      showToast("Connect a repository to create issues");
      return;
    }
    start(async () => {
      const res = await createIssue({
        title,
        body,
        status,
        assignees: assignee ? [assignee] : [],
        labels: [...labels],
        milestone: milestone === "" ? null : Number(milestone),
      });
      if (res.ok) {
        showToast(`#${res.number} created`);
        close();
      } else {
        showToast(res.error ?? "Could not create issue");
      }
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0"
        style={{ background: "var(--overlay)" }}
        onClick={close}
        aria-hidden
      />
      <form
        onSubmit={submit}
        role="dialog"
        aria-label="New issue"
        className="absolute left-1/2 top-1/2 flex w-[520px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-fg">New issue</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-fg-muted hover:bg-hover"
          >
            ✕
          </button>
        </div>

        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Issue title"
          className={`${fieldClass} text-[14px] font-medium`}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Description (optional)"
          rows={4}
          className={`${fieldClass} resize-y`}
        />

        <div className="grid grid-cols-3 gap-2">
          <label className="flex flex-col gap-1 text-[12px] text-fg-subtle">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusKey)}
              className={fieldClass}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS[s].label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-fg-subtle">
            Assignee
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className={fieldClass}
            >
              <option value="">Unassigned</option>
              {meta.assignees.map((a) => (
                <option key={a.login} value={a.login}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-fg-subtle">
            Milestone
            <select
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              className={fieldClass}
            >
              <option value="">None</option>
              {meta.milestones.map((m) => (
                <option key={m.number} value={m.number}>
                  {m.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {meta.labels.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-fg-subtle">Labels</span>
            <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
              {meta.labels.map((l) => {
                const on = labels.has(l.name);
                return (
                  <button
                    key={l.name}
                    type="button"
                    onClick={() => toggleLabel(l.name)}
                    aria-pressed={on}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                      on
                        ? "bg-accent-soft text-accent-fg"
                        : "bg-hover text-fg-muted"
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: l.color }}
                    />
                    {l.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-1 flex items-center justify-end gap-2">
          {!live && (
            <span className="mr-auto text-[12px] text-fg-subtle">
              Connect a repository to create issues.
            </span>
          )}
          <button
            type="button"
            onClick={close}
            className="rounded-lg px-3 py-1.5 text-[13px] text-fg-muted hover:bg-hover"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !title.trim()}
            className="rounded-lg bg-accent px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Creating…" : "Create issue"}
          </button>
        </div>
      </form>
    </div>
  );
}
