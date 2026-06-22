import { auth } from "@/auth";
import { getGithubToken } from "@/lib/github-token";
import { listUserRepos, type GitHubRepo } from "@/lib/github-repos";
import { getCurrentRepo } from "@/lib/workspace";
import { ErrorBanner } from "@/components/states/error-banner";
import { EmptyState } from "@/components/states/empty-state";
import { RepoPicker } from "@/components/settings/repo-picker";
import { WorkspaceSection } from "./workspace-section";
import { ThemeSection } from "./theme-section";

export default async function SettingsPage() {
  const session = await auth();

  let repos: GitHubRepo[] = [];
  let error: string | null = null;
  let activeFullName: string | null = null;

  if (session?.user) {
    activeFullName = (await getCurrentRepo(session.user.id))?.fullName ?? null;
    try {
      const token = await getGithubToken(session.user.id);
      if (!token) {
        error = "No GitHub token on file — sign out and back in to reconnect.";
      } else {
        repos = await listUserRepos(token);
      }
    } catch {
      error = "Could not load your repositories from GitHub. Try again.";
    }
  }

  return (
    <div className="px-6 py-5">
      <h1 className="text-lg font-semibold tracking-tight text-fg">Settings</h1>
      <p className="mt-0.5 text-[13px] text-fg-muted">
        Choose the repository Terragon works against.
      </p>

      <div className="mt-6 max-w-2xl">
        <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-fg-subtle">
          Repository
        </h2>

        {error && <ErrorBanner message={error} />}

        {!error && repos.length === 0 && (
          <EmptyState
            title="No repositories found"
            subtitle="Terragon needs access to at least one GitHub repository."
          />
        )}

        {repos.length > 0 && (
          <RepoPicker repos={repos} activeFullName={activeFullName} />
        )}
      </div>

      <WorkspaceSection />
      <ThemeSection />
    </div>
  );
}
