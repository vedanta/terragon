"use client";

import { openCreateIssue } from "@/components/create-issue/events";

export function NewIssueButton() {
  return (
    <button
      type="button"
      onClick={openCreateIssue}
      title="New issue (N)"
      className="rounded-lg bg-accent px-2.5 py-1.5 text-[13px] font-medium text-white hover:opacity-90"
    >
      New issue
    </button>
  );
}
