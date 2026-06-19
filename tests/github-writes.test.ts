import { describe, it, expect, vi } from "vitest";
import type { Octokit } from "octokit";
import { GitHubClient, type RestOps } from "@/lib/github/client";
import { transitionPlan } from "@/lib/status/transition";

function recordingRest(over: Partial<RestOps> = {}) {
  const calls: string[] = [];
  const rest: RestOps = {
    listLabelNames: vi.fn(async () => ["terragon/planned"]),
    createLabel: vi.fn(async (_o, _r, name) => {
      calls.push(`create:${name}`);
    }),
    addLabels: vi.fn(async (_o, _r, n, labels) => {
      calls.push(`add:${labels.join(",")}@${n}`);
    }),
    removeLabel: vi.fn(async (_o, _r, n, name) => {
      calls.push(`remove:${name}@${n}`);
    }),
    setIssueState: vi.fn(async (_o, _r, n, state) => {
      calls.push(`state:${state}@${n}`);
    }),
    ...over,
  };
  return { rest, calls };
}

describe("GitHubClient writes", () => {
  it("ensureLabels creates only the missing labels", async () => {
    const { rest } = recordingRest();
    const client = new GitHubClient({ rest });
    await client.ensureLabels("o", "r", [
      { name: "terragon/planned", color: "a" }, // exists
      { name: "terragon/done", color: "b" }, // missing
    ]);
    expect(rest.createLabel).toHaveBeenCalledTimes(1);
    expect(rest.createLabel).toHaveBeenCalledWith(
      "o",
      "r",
      "terragon/done",
      "b",
    );
  });

  it("applyTransition adds the target label before removing others, then closes", async () => {
    const { rest, calls } = recordingRest();
    const client = new GitHubClient({ rest });
    const plan = transitionPlan("planned", "done", { autoCloseDone: true });
    await client.applyTransition("o", "r", 7, plan);

    const addIdx = calls.findIndex((c) => c.startsWith("add:"));
    const firstRemoveIdx = calls.findIndex((c) => c.startsWith("remove:"));
    expect(addIdx).toBeGreaterThanOrEqual(0);
    expect(addIdx).toBeLessThan(firstRemoveIdx); // add-then-remove
    expect(calls).toContain("add:terragon/done@7");
    expect(calls).toContain("state:closed@7"); // auto-close
  });

  it("applyTransition reopens when leaving Done", async () => {
    const { rest, calls } = recordingRest();
    const client = new GitHubClient({ rest });
    const plan = transitionPlan("done", "in-progress", { autoCloseDone: true });
    await client.applyTransition("o", "r", 9, plan);
    expect(calls).toContain("state:open@9");
  });

  it("octokit-backed removeLabel swallows a 404 (label not on issue)", async () => {
    const removeLabel = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error("not found"), { status: 404 }),
      );
    const octokit = {
      graphql: vi.fn(),
      rest: {
        issues: {
          listLabelsForRepo: vi.fn().mockResolvedValue({ data: [] }),
          createLabel: vi.fn().mockResolvedValue({}),
          addLabels: vi.fn().mockResolvedValue({}),
          removeLabel,
          update: vi.fn().mockResolvedValue({}),
        },
      },
    } as unknown as Octokit;

    const client = new GitHubClient({ octokit });
    const plan = transitionPlan("planned", "in-progress", {
      autoCloseDone: false,
    });
    await expect(
      client.applyTransition("o", "r", 1, plan),
    ).resolves.toBeUndefined();
    expect(removeLabel).toHaveBeenCalled();
  });
});
