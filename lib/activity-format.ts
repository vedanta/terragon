import { STATUS, type StatusKey } from "@/fixtures/seed";

export interface ActivityItem {
  id: string;
  type: string;
  status: string;
  title: string;
  detail: string | null;
  error: string | null;
  at: string; // ISO timestamp
}

function statusLabel(key: unknown): string {
  return typeof key === "string" && key in STATUS
    ? STATUS[key as StatusKey].label
    : String(key ?? "");
}

/** Turn a stored sync_event into a human title + detail. Pure; unit-tested. */
export function describeActivity(
  type: string,
  payloadRaw: string | null,
): { title: string; detail: string | null } {
  let p: Record<string, unknown> = {};
  try {
    if (payloadRaw) p = JSON.parse(payloadRaw);
  } catch {
    /* ignore malformed payloads */
  }
  switch (type) {
    case "batch_update": {
      const count = Number(p.count ?? 0);
      const failed = Number(p.failed ?? 0);
      return {
        title: `Groomed ${count} issue${count === 1 ? "" : "s"}`,
        detail: `${Number(p.updated ?? 0)} updated${failed ? `, ${failed} failed` : ""}`,
      };
    }
    case "status_change":
      return {
        title: `#${p.issue} → ${statusLabel(p.to)}`,
        detail: p.from ? `from ${statusLabel(p.from)}` : null,
      };
    case "issue_created":
      return {
        title: `Created #${p.number}`,
        detail: p.status ? `as ${statusLabel(p.status)}` : null,
      };
    default:
      return { title: type, detail: null };
  }
}
