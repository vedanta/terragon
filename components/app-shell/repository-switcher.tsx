import Link from "next/link";
import { getBoardData } from "@/lib/board-data";

/** Shows the active repository; links to Settings to change it. */
export async function RepositorySwitcher() {
  const { repo } = await getBoardData();
  return (
    <Link
      href="/settings"
      title="Change repository in Settings"
      className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-[13px] text-fg hover:bg-hover"
    >
      <span className="text-fg-subtle">repo</span>
      <span className="font-medium">{repo ?? "Select a repository"}</span>
      <span className="text-fg-subtle">▾</span>
    </Link>
  );
}
