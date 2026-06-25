import { getRecentActivity } from "@/lib/activity";
import { relativeTime } from "@/lib/view/board-issue";
import { EmptyState } from "@/components/states/empty-state";

export default async function ActivityPage() {
  const items = await getRecentActivity();

  return (
    <div className="px-6 py-5">
      <h1 className="text-lg font-semibold tracking-tight text-fg">Activity</h1>
      <p className="mt-0.5 text-[13px] text-fg-muted">
        Recent changes Terragon made to GitHub
      </p>

      {items.length === 0 ? (
        <div className="mt-6 max-w-2xl">
          <EmptyState
            title="No activity yet"
            subtitle="Status changes, grooming batches, and new issues show up here once you make them on a connected repository."
          />
        </div>
      ) : (
        <ul className="mt-6 flex max-w-2xl flex-col">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-start justify-between gap-4 border-b border-border py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[13px] text-fg">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      background:
                        it.status === "ok" ? "var(--green)" : "#e5484d",
                    }}
                  />
                  <span className="truncate">{it.title}</span>
                </div>
                {it.detail && (
                  <div className="mt-0.5 pl-3.5 text-[12px] text-fg-subtle">
                    {it.detail}
                  </div>
                )}
                {it.status !== "ok" && it.error && (
                  <div className="mt-0.5 pl-3.5 text-[12px] text-fg-subtle">
                    {it.error}
                  </div>
                )}
              </div>
              <span className="shrink-0 whitespace-nowrap text-[12px] text-fg-subtle">
                {relativeTime(it.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
