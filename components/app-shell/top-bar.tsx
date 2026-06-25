import { RepositorySwitcher } from "./repository-switcher";
import { NewIssueButton } from "./new-issue-button";
import { CardViewToggle } from "./card-view-toggle";
import { HelpButton } from "./help-button";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-bg px-4">
      <RepositorySwitcher />
      <div className="ml-auto flex items-center gap-2">
        <NewIssueButton />
        <CardViewToggle />
        <HelpButton />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
