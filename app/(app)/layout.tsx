import { Sidebar } from "@/components/app-shell/sidebar";
import { TopBar } from "@/components/app-shell/top-bar";
import { ToastProvider } from "@/components/toast/toast";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { getBoardData } from "@/lib/board-data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { issues } = await getBoardData();
  return (
    <ToastProvider>
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
      <CommandPalette issues={issues} />
      <KeyboardShortcuts />
    </ToastProvider>
  );
}
