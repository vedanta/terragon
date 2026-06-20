import { describe, it, expect, vi } from "vitest";
import {
  buildPlan,
  executePlan,
  type BatchClient,
  type IssueRef,
} from "@/lib/grooming/service";
import { DEFAULT_STATUS_LABELS } from "@/lib/status/transition";

const config = { labels: DEFAULT_STATUS_LABELS, autoCloseDone: true };

function stubClient(over: Partial<BatchClient> = {}): BatchClient {
  return {
    run: (fn) => fn(),
    applyTransition: vi.fn(async () => {}),
    addLabel: vi.fn(async () => {}),
    removeLabel: vi.fn(async () => {}),
    setAssignees: vi.fn(async () => {}),
    setMilestone: vi.fn(async () => {}),
    ...over,
  };
}

describe("buildPlan", () => {
  it("plans a transition only when the status actually changes", () => {
    const issues: IssueRef[] = [
      { number: 1, status: "planned" },
      { number: 2, status: "in-progress" },
    ];
    const ops = buildPlan(issues, { status: "in-progress" }, config);
    expect(ops[0].transition?.addLabel).toBe("terragon/in-progress");
    expect(ops[1].transition).toBeUndefined();
  });

  it("carries assignee / milestone / labels", () => {
    const ops = buildPlan(
      [{ number: 1, status: "planned" }],
      {
        assignee: "maya",
        milestone: 3,
        addLabels: ["bug"],
        removeLabels: ["ux"],
      },
      config,
    );
    expect(ops[0]).toMatchObject({
      assignees: ["maya"],
      milestone: 3,
      addLabels: ["bug"],
      removeLabels: ["ux"],
    });
  });

  it("treats assignee:null as unassign", () => {
    const ops = buildPlan(
      [{ number: 1, status: "planned" }],
      { assignee: null },
      config,
    );
    expect(ops[0].assignees).toEqual([]);
  });
});

describe("executePlan", () => {
  it("reports partial success when one issue fails", async () => {
    const client = stubClient({
      applyTransition: vi.fn(async (_o, _r, n) => {
        if (n === 2) throw new Error("no permission");
      }),
    });
    const issues: IssueRef[] = [1, 2, 3].map((number) => ({
      number,
      status: "planned" as const,
    }));
    const ops = buildPlan(issues, { status: "done" }, config);
    const res = await executePlan(client, "o", "r", ops);
    expect(res.updated).toEqual([1, 3]);
    expect(res.failed).toEqual([{ number: 2, reason: "no permission" }]);
  });

  it("completes a 50-issue batch", async () => {
    const client = stubClient();
    const issues: IssueRef[] = Array.from({ length: 50 }, (_, i) => ({
      number: i + 1,
      status: "planned" as const,
    }));
    const ops = buildPlan(issues, { assignee: "maya" }, config);
    const res = await executePlan(client, "o", "r", ops);
    expect(res.updated).toHaveLength(50);
    expect(res.failed).toHaveLength(0);
    expect(client.setAssignees).toHaveBeenCalledTimes(50);
  });
});
