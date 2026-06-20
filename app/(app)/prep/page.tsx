import { getBoardData } from "@/lib/board-data";
import { groupBoardIssues } from "@/lib/view/board-issue";
import { type StatusKey } from "@/fixtures/seed";
import { IssueList } from "@/components/views/issue-list";

const SECTIONS: { title: string; key: StatusKey }[] = [
  { title: "Ready to Start", key: "planned" },
  { title: "Active", key: "in-progress" },
  { title: "Recently Done", key: "done" },
  { title: "Backburner", key: "backburner" },
];

export default async function PrepPage() {
  const { issues } = await getBoardData();
  const columns = groupBoardIssues(issues);
  const by = (k: StatusKey) => columns.find((c) => c.key === k)?.issues ?? [];

  return (
    <div className="px-6 py-5">
      <h1 className="text-lg font-semibold tracking-tight text-fg">
        Prep Station
      </h1>
      <p className="mt-0.5 text-[13px] text-fg-muted">
        Work readiness at a glance
      </p>

      <div className="mt-6 flex max-w-3xl flex-col gap-6">
        {SECTIONS.map((s) => {
          const list = by(s.key);
          return (
            <section key={s.key}>
              <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-fg-subtle">
                {s.title} · {list.length}
              </h2>
              <IssueList issues={list} />
            </section>
          );
        })}
      </div>
    </div>
  );
}
