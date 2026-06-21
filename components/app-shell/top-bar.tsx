import { RepositorySwitcher } from "./repository-switcher";
import { SearchTrigger } from "./search-trigger";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-bg px-4">
      <RepositorySwitcher />
      <SearchTrigger />
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
