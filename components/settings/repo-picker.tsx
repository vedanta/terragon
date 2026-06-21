"use client";

import { Command } from "cmdk";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type GitHubRepo } from "@/lib/github-repos";
import { chooseRepo } from "@/app/(app)/settings/actions";
import { useToast } from "@/components/toast/toast";

export function RepoPicker({
  repos,
  activeFullName,
}: {
  repos: GitHubRepo[];
  activeFullName: string | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [choosing, setChoosing] = useState<string | null>(null);

  function pick(repo: GitHubRepo) {
    if (repo.fullName === activeFullName) return;
    setChoosing(repo.fullName);
    startTransition(async () => {
      await chooseRepo({
        githubRepoId: String(repo.id),
        owner: repo.owner,
        name: repo.name,
        fullName: repo.fullName,
        private: repo.private,
        defaultBranch: repo.defaultBranch,
      });
      showToast(`Active repository: ${repo.fullName}`);
      setChoosing(null);
      router.refresh();
    });
  }

  return (
    <div>
      {activeFullName && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] shadow-[var(--shadow)]">
          <span className="text-fg-subtle">Active</span>
          <span className="font-medium text-fg">{activeFullName}</span>
          <span
            className="ml-auto h-2 w-2 rounded-full"
            style={{ background: "var(--green)" }}
          />
        </div>
      )}

      <Command
        label="Select a repository"
        className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow)]"
        filter={(value, search) =>
          value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
        }
      >
        <Command.Input
          placeholder="Search repositories…"
          className="w-full border-b border-border bg-transparent px-4 py-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle"
        />
        <Command.List className="max-h-72 overflow-auto p-1.5">
          <Command.Empty className="px-3 py-6 text-center text-[13px] text-fg-subtle">
            No repositories match.
          </Command.Empty>
          {repos.map((r) => {
            const active = r.fullName === activeFullName;
            return (
              <Command.Item
                key={r.id}
                value={r.fullName}
                onSelect={() => pick(r)}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-fg data-[selected=true]:bg-hover"
              >
                <span className="truncate">{r.fullName}</span>
                {r.private && (
                  <span className="rounded bg-hover px-1.5 py-0.5 text-[11px] text-fg-subtle">
                    private
                  </span>
                )}
                <span className="ml-auto shrink-0 text-[12px]">
                  {active ? (
                    <span className="text-accent-fg">✓ Active</span>
                  ) : choosing === r.fullName && pending ? (
                    <span className="text-fg-subtle">Setting…</span>
                  ) : (
                    <span className="text-fg-subtle">Select</span>
                  )}
                </span>
              </Command.Item>
            );
          })}
        </Command.List>
      </Command>
    </div>
  );
}
