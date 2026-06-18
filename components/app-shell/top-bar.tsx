import { RepositorySwitcher } from "./repository-switcher";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-bg px-4">
      <RepositorySwitcher />
      <input
        type="search"
        aria-label="Search issues"
        placeholder="Search…"
        className="h-8 w-64 rounded-lg border border-border bg-bg px-3 text-[13px] text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-accent-soft"
      />
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
