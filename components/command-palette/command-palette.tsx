"use client";

import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type BoardIssue } from "@/lib/view/board-issue";
import { applyThemeMode, getStoredMode, resolveTheme } from "@/lib/theme";
import { openCreateIssue } from "@/components/create-issue/events";
import { OPEN_PALETTE_EVENT } from "./events";

export function CommandPalette({ issues }: { issues: BoardIssue[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  function go(path: string) {
    setOpen(false);
    router.push(path);
  }

  function toggleTheme() {
    const resolved = resolveTheme(getStoredMode());
    applyThemeMode(resolved === "dark" ? "light" : "dark");
    setOpen(false);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      loop
    >
      <Command.Input placeholder="Search issues or run a command…" />
      <Command.List>
        <Command.Empty>No results</Command.Empty>

        <Command.Group heading="Actions">
          <Command.Item
            value="create new issue"
            onSelect={() => {
              setOpen(false);
              openCreateIssue();
            }}
          >
            + Create new issue
          </Command.Item>
          <Command.Item value="go to board" onSelect={() => go("/board")}>
            Go to Board
          </Command.Item>
          <Command.Item value="go to grooming" onSelect={() => go("/grooming")}>
            Go to Grooming
          </Command.Item>
          <Command.Item value="toggle theme" onSelect={toggleTheme}>
            Toggle theme
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Issues">
          {issues.map((i) => (
            <Command.Item
              key={i.number}
              value={`#${i.number} ${i.title}`}
              onSelect={() => go("/board")}
            >
              <span className="text-fg-subtle">#{i.number}</span>
              <span>{i.title || "Untitled issue"}</span>
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
