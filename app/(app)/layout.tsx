import { Suspense } from "react";
import { Sidebar } from "@/components/app-shell/sidebar";
import { TopBar } from "@/components/app-shell/top-bar";
import { ToastProvider } from "@/components/toast/toast";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { ShortcutsHelp } from "@/components/help/shortcuts-help";
import { ProgressBar } from "@/components/progress/progress-bar";
import { CreateIssueModal } from "@/components/create-issue/create-issue-modal";
import { getBoardData } from "@/lib/board-data";
import { getBoardMeta } from "@/lib/board-meta";

/** Streams the palette's issue list so the shell paints without blocking on GitHub. */
async function CommandPaletteLoader() {
  const { issues } = await getBoardData();
  return <CommandPalette issues={issues} />;
}

/** Streams the new-issue modal's field options + live flag. */
async function CreateIssueLoader() {
  const [{ source }, meta] = await Promise.all([
    getBoardData(),
    getBoardMeta(),
  ]);
  return <CreateIssueModal meta={meta} live={source === "live"} />;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ProgressBar />
      <div className="flex h-screen bg-bg text-fg">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <MobileNav />
          <main className="min-h-0 flex-1 overflow-auto bg-col">
            {children}
          </main>
        </div>
      </div>
      <Suspense fallback={null}>
        <CommandPaletteLoader />
      </Suspense>
      <Suspense fallback={null}>
        <CreateIssueLoader />
      </Suspense>
      <KeyboardShortcuts />
      <ShortcutsHelp />
    </ToastProvider>
  );
}
