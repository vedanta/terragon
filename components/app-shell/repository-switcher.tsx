import Link from "next/link";
import { getBoardData } from "@/lib/board-data";
import { getActiveRepoAccess } from "@/lib/active-repo-access";

const badge = "rounded px-1.5 py-0.5 text-[11px] leading-none text-fg-subtle";

/** Shows the active repository + access tags; links to Settings to change it. */
export async function RepositorySwitcher() {
  const [{ repo }, access] = await Promise.all([
    getBoardData(),
    getActiveRepoAccess(),
  ]);

  return (
    <Link
      href="/settings"
      title="Change repository in Settings"
      className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-[13px] text-fg hover:bg-hover"
    >
      <span className="text-fg-subtle">repo</span>
      <span className="font-medium">{repo ?? "Select a repository"}</span>
      {repo && access && (
        <>
          {access.private && (
            <span className={`${badge} bg-hover`}>private</span>
          )}
          {access.relation === "org" && (
            <span className={`${badge} bg-hover`}>Org</span>
          )}
          {access.relation === "collaborator" && (
            <span className={`${badge} bg-hover`}>Shared</span>
          )}
          {access.readOnly && (
            <span
              className={`${badge} border border-border-strong`}
              title="You don't have write access — board changes will be rejected by GitHub"
            >
              Read-only
            </span>
          )}
        </>
      )}
      <span className="text-fg-subtle">▾</span>
    </Link>
  );
}
