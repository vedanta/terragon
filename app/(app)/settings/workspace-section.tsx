import { auth } from "@/auth";
import { getCurrentRepo, getWorkspaceConfig } from "@/lib/workspace";
import { saveWorkspace } from "./actions";

const FIELDS = [
  { key: "planned", label: "Planned label" },
  { key: "in-progress", label: "In Progress label" },
  { key: "done", label: "Done label" },
  { key: "backburner", label: "Backburner label" },
] as const;

export async function WorkspaceSection() {
  const session = await auth();
  if (!session?.user) return null;
  const repo = await getCurrentRepo(session.user.id);
  if (!repo) return null;
  const cfg = await getWorkspaceConfig(repo.id);

  return (
    <div className="mt-8 max-w-2xl">
      <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-fg-subtle">
        Workspace · {repo.fullName}
      </h2>
      <form
        action={saveWorkspace}
        className="flex flex-col gap-3 rounded-xl border border-border p-4"
      >
        {FIELDS.map((f) => (
          <label
            key={f.key}
            className="flex items-center justify-between gap-3 text-[13px]"
          >
            <span className="text-fg-muted">{f.label}</span>
            <input
              name={`label-${f.key}`}
              defaultValue={cfg.labels[f.key]}
              className="w-64 rounded-lg border border-border bg-bg px-2 py-1 text-[13px] text-fg focus:outline-none focus:ring-2 focus:ring-accent-soft"
            />
          </label>
        ))}
        <label className="flex items-center gap-2 text-[13px] text-fg">
          <input
            type="checkbox"
            name="autoCloseDone"
            defaultChecked={cfg.autoCloseDone}
          />
          Close the GitHub issue when moved to Done
        </label>
        <button
          type="submit"
          className="self-start rounded-lg bg-accent px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90"
        >
          Save
        </button>
      </form>
    </div>
  );
}
