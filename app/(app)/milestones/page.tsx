import { getBoardData } from "@/lib/board-data";
import { groupByMilestone } from "@/lib/view/board-issue";
import { IssueList } from "@/components/views/issue-list";

export default async function MilestonesPage() {
  const { issues } = await getBoardData();
  const groups = groupByMilestone(issues).sort((a, b) => b.total - a.total);

  return (
    <div className="px-6 py-5">
      <h1 className="text-lg font-semibold tracking-tight text-fg">
        Milestones
      </h1>
      <p className="mt-0.5 text-[13px] text-fg-muted">Progress by milestone</p>

      <div className="mt-6 flex max-w-3xl flex-col gap-6">
        {groups.map((g) => {
          const pct = g.total ? Math.round((g.done / g.total) * 100) : 0;
          return (
            <section key={g.title}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-fg">{g.title}</h2>
                <span className="text-[12px] text-fg-subtle">
                  {g.done}/{g.total} done · {pct}%
                </span>
              </div>
              <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-hover">
                <div
                  className="h-full rounded-full bg-green"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <IssueList issues={g.issues} />
            </section>
          );
        })}
      </div>
    </div>
  );
}
