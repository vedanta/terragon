import { auth } from "@/auth";
import { getGithubToken } from "@/lib/github-token";
import { listUserRepos, type GitHubRepo } from "@/lib/github-repos";
import { ErrorBanner } from "@/components/states/error-banner";
import { EmptyState } from "@/components/states/empty-state";
import { selectRepo } from "./actions";

export default async function SettingsPage() {
  const session = await auth();

  let repos: GitHubRepo[] = [];
  let error: string | null = null;

  if (session?.user) {
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
          <ul className="overflow-hidden rounded-xl border border-border">
            {repos.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between border-b border-border px-4 py-2.5 last:border-b-0 hover:bg-hover"
              >
                <span className="flex items-center gap-2 text-[13px] text-fg">
                  {r.fullName}
                  {r.private && (
                    <span className="rounded bg-hover px-1.5 py-0.5 text-[11px] text-fg-subtle">
                      private
                    </span>
                  )}
                </span>
                <form action={selectRepo}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="owner" value={r.owner} />
                  <input type="hidden" name="name" value={r.name} />
                  <input type="hidden" name="fullName" value={r.fullName} />
                  <input
                    type="hidden"
                    name="private"
                    value={String(r.private)}
                  />
                  <input
                    type="hidden"
                    name="defaultBranch"
                    value={r.defaultBranch}
                  />
                  <button
                    type="submit"
                    className="rounded-lg border border-border px-3 py-1 text-[13px] text-fg hover:bg-bg"
                  >
                    Select
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
