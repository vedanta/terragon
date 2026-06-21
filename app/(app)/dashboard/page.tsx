import { getBoardData } from "@/lib/board-data";
import { groupBoardIssues } from "@/lib/view/board-issue";
import { dashboardStats, statusDistribution } from "@/lib/view/dashboard";
import { type StatusKey } from "@/fixtures/seed";
import { IssueList } from "@/components/views/issue-list";
import { StatCards } from "@/components/dashboard/stat-cards";
import { StatusBar } from "@/components/dashboard/status-bar";

const SECTIONS: { title: string; key: StatusKey }[] = [
  { title: "Ready to Start", key: "planned" },
  { title: "Active", key: "in-progress" },
  { title: "Recently Done", key: "done" },
  { title: "Backburner", key: "backburner" },
];

export default async function DashboardPage() {
  const { issues } = await getBoardData();
  const stats = dashboardStats(issues);
  const distribution = statusDistribution(issues);
  const columns = groupBoardIssues(issues);
  const by = (k: StatusKey) => columns.find((c) => c.key === k)?.issues ?? [];

  return (
    <div className="px-6 py-5">
      <h1 className="text-lg font-semibold tracking-tight text-fg">
        Dashboard
      </h1>
      <p className="mt-0.5 text-[13px] text-fg-muted">Your work at a glance</p>

      <div className="mt-6 flex max-w-4xl flex-col gap-6">
        <StatCards stats={stats} />

        {stats.total > 0 && (
          <section className="rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow)]">
            <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-fg-subtle">
              Status distribution
            </h2>
            <StatusBar segments={distribution} />
          </section>
        )}

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
