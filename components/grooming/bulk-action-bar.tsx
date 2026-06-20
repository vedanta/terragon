"use client";

import { useState } from "react";
import { STATUS_ORDER, STATUS, type StatusKey } from "@/fixtures/seed";
import { type DrawerMeta } from "@/lib/board-meta";
import { type Changeset } from "@/lib/grooming/service";

const sel =
  "rounded-lg border border-border bg-bg px-2 py-1 text-[13px] text-fg focus:outline-none focus:ring-2 focus:ring-accent-soft";

export function BulkActionBar({
  count,
  meta,
  pending,
  onApply,
  onClear,
}: {
  count: number;
  meta: DrawerMeta;
  pending: boolean;
  onApply: (cs: Changeset) => void;
  onClear: () => void;
}) {
  const [status, setStatus] = useState("");
  const [assignee, setAssignee] = useState("__keep");
  const [milestone, setMilestone] = useState("__keep");
  const [addLabel, setAddLabel] = useState("");
  const [removeLabel, setRemoveLabel] = useState("");

  function build(): Changeset {
    const cs: Changeset = {};
    if (status) cs.status = status as StatusKey;
    if (assignee !== "__keep")
      cs.assignee = assignee === "__none" ? null : assignee;
    if (milestone !== "__keep")
      cs.milestone = milestone === "__none" ? null : Number(milestone);
    if (addLabel) cs.addLabels = [addLabel];
    if (removeLabel) cs.removeLabels = [removeLabel];
    return cs;
  }

  const hasChange = Object.keys(build()).length > 0;

  return (
    <div className="fixed bottom-4 left-1/2 z-30 flex max-w-[95vw] -translate-x-1/2 flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-[var(--shadow-lg)]">
      <span className="text-[13px] font-medium text-fg">{count} selected</span>

      <select
        aria-label="Set status"
        className={sel}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">Status…</option>
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS[s].label}
          </option>
        ))}
      </select>

      <select
        aria-label="Set assignee"
        className={sel}
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
      >
        <option value="__keep">Assignee…</option>
        <option value="__none">Unassign</option>
        {meta.assignees.map((a) => (
          <option key={a.login} value={a.login}>
            {a.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Set milestone"
        className={sel}
        value={milestone}
        onChange={(e) => setMilestone(e.target.value)}
      >
        <option value="__keep">Milestone…</option>
        <option value="__none">Clear</option>
        {meta.milestones.map((m) => (
          <option key={m.number} value={m.number}>
            {m.title}
          </option>
        ))}
      </select>

      {meta.labels.length > 0 && (
        <>
          <select
            aria-label="Add label"
            className={sel}
            value={addLabel}
            onChange={(e) => setAddLabel(e.target.value)}
          >
            <option value="">+ Label…</option>
            {meta.labels.map((l) => (
              <option key={l.name} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Remove label"
            className={sel}
            value={removeLabel}
            onChange={(e) => setRemoveLabel(e.target.value)}
          >
            <option value="">− Label…</option>
            {meta.labels.map((l) => (
              <option key={l.name} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </>
      )}

      <button
        type="button"
        onClick={() => onApply(build())}
        disabled={!hasChange || pending}
        className="rounded-lg bg-accent px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? `Updating ${count}…` : "Apply Updates"}
      </button>

      <button
        type="button"
        onClick={() => onApply({ status: "backburner" })}
        disabled={pending}
        className="rounded-lg border border-border px-2.5 py-1.5 text-[13px] text-fg hover:bg-hover disabled:opacity-50"
      >
        Backburner
      </button>
      <button
        type="button"
        onClick={() => onApply({ status: "done" })}
        disabled={pending}
        className="rounded-lg border border-border px-2.5 py-1.5 text-[13px] text-fg hover:bg-hover disabled:opacity-50"
      >
        Mark Done
      </button>

      <button
        type="button"
        onClick={onClear}
        disabled={pending}
        className="text-[13px] text-fg-muted hover:text-fg disabled:opacity-50"
      >
        Clear
      </button>
    </div>
  );
}
