"use client";

import { useState, useTransition } from "react";
import { type BoardIssue } from "@/lib/view/board-issue";
import { Avatar } from "@/components/ui/avatar";
import { LabelChip } from "@/components/ui/label-chip";
import { StatusBadge } from "@/components/ui/status-badge";
import { IssueDrawer } from "@/components/issue/issue-drawer";
import { EmptyState } from "@/components/states/empty-state";
import { useToast } from "@/components/toast/toast";
import { type DrawerMeta } from "@/lib/board-meta";
import { applyBatch } from "@/app/(app)/grooming/actions";
import {
  type Changeset,
  type IssueRef,
  type BatchResult,
} from "@/lib/grooming/service";
import { BulkActionBar } from "./bulk-action-bar";
import { BatchResultPanel } from "./batch-result";

export function GroomingTable({
  issues,
  meta,
}: {
  issues: BoardIssue[];
  meta: DrawerMeta;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [drawer, setDrawer] = useState<number | null>(null);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  if (issues.length === 0) {
    return (
      <div className="p-6">
        <EmptyState title="No issues to groom" />
      </div>
    );
  }

  const allChecked = selected.size === issues.length;

  function toggle(n: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(issues.map((i) => i.number)));
  }

  function apply(cs: Changeset) {
    if (Object.keys(cs).length === 0) {
      showToast("Pick a change first");
      return;
    }
    const sel: IssueRef[] = issues
      .filter((i) => selected.has(i.number))
      .map((i) => ({ number: i.number, status: i.status }));
    startTransition(async () => {
      const res = await applyBatch(sel, cs);
      setResult(res);
      if (res.failed.length === 0) setSelected(new Set());
    });
  }

  const drawerIssue = issues.find((i) => i.number === drawer) ?? null;

  return (
    <>
      <div className="overflow-auto p-4">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[12px] text-fg-subtle">
              <th className="w-8 px-2 py-2 font-medium">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allChecked}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-2 py-2 font-medium">#</th>
              <th className="px-2 py-2 font-medium">Title</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium">Assignee</th>
              <th className="px-2 py-2 font-medium">Labels</th>
              <th className="px-2 py-2 font-medium">Milestone</th>
              <th className="px-2 py-2 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((i) => {
              const person = i.assignee;
              const checked = selected.has(i.number);
              return (
                <tr
                  key={i.number}
                  className={
                    "border-b border-border " +
                    (checked ? "bg-accent-soft" : "hover:bg-hover")
                  }
                >
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Select #${i.number}`}
                      checked={checked}
                      onChange={() => toggle(i.number)}
                    />
                  </td>
                  <td className="px-2 py-2 text-fg-subtle">#{i.number}</td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => setDrawer(i.number)}
                      className="text-left text-fg hover:underline"
                    >
                      {i.title || "Untitled issue"}
                    </button>
                  </td>
                  <td className="px-2 py-2">
                    <StatusBadge status={i.status} />
                  </td>
                  <td className="px-2 py-2">
                    {person ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Avatar person={person} size={16} />
                        {person.name}
                      </span>
                    ) : (
                      <span className="text-fg-subtle">Unassigned</span>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <span className="flex flex-wrap gap-1">
                      {i.labels.map((l) => (
                        <LabelChip key={l.name} label={l} />
                      ))}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-fg-muted">
                    {i.milestone ?? "—"}
                  </td>
                  <td className="px-2 py-2 text-fg-subtle">{i.updated}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected.size > 0 && (
        <BulkActionBar
          count={selected.size}
          meta={meta}
          pending={isPending}
          onApply={apply}
          onClear={() => setSelected(new Set())}
        />
      )}

      {result && (
        <BatchResultPanel result={result} onDismiss={() => setResult(null)} />
      )}

      <IssueDrawer
        issue={drawerIssue}
        onClose={() => setDrawer(null)}
        meta={meta}
      />
    </>
  );
}
