import { getBoardData } from "@/lib/board-data";
import { getViewerLogin } from "@/lib/viewer";
import { groupBoardIssues } from "@/lib/view/board-issue";
import { IssueList } from "@/components/views/issue-list";
import { STATUS_ORDER, STATUS } from "@/fixtures/seed";

export default async function MyWorkPage() {
  const { issues } = await getBoardData();
  const login = await getViewerLogin();
  const mine = login ? issues.filter((i) => i.assigneeLogin === login) : [];
  const columns = groupBoardIssues(mine);

  return (
    <div className="px-6 py-5">
      <h1 className="text-lg font-semibold tracking-tight text-fg">My Work</h1>
      <p className="mt-0.5 text-[13px] text-fg-muted">
        {mine.length} issue{mine.length === 1 ? "" : "s"} assigned to you
      </p>

      <div className="mt-6 flex max-w-3xl flex-col gap-6">
        {STATUS_ORDER.map((key) => {
          const list = columns.find((c) => c.key === key)?.issues ?? [];
          if (list.length === 0) return null;
          return (
            <section key={key}>
              <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-fg-subtle">
                {STATUS[key].label} · {list.length}
              </h2>
              <IssueList issues={list} />
            </section>
          );
        })}
        {mine.length === 0 && (
          <p className="text-[13px] text-fg-subtle">
            Nothing assigned to you right now.
          </p>
        )}
      </div>
    </div>
  );
}
