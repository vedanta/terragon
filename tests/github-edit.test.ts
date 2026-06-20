import { describe, it, expect, vi } from "vitest";
import { GitHubClient, type RestOps } from "@/lib/github/client";

function stubRest(over: Partial<RestOps> = {}): RestOps {
  return {
    listLabelNames: vi.fn(async () => []),
    createLabel: vi.fn(),
    addLabels: vi.fn(),
    removeLabel: vi.fn(),
    setIssueState: vi.fn(),
    updateIssue: vi.fn(),
    setAssignees: vi.fn(),
    setMilestone: vi.fn(),
    ...over,
  };
}

describe("GitHubClient field edits", () => {
  it("getRepoMetadata maps the GraphQL response", async () => {
    const gql = vi.fn().mockResolvedValue({
      repository: {
        labels: { nodes: [{ name: "bug", color: "e5484d" }] },
        milestones: { nodes: [{ number: 3, title: "v1" }] },
        assignableUsers: {
          nodes: [{ login: "octocat", name: "The Octocat", avatarUrl: "a" }],
        },
      },
    });
    const client = new GitHubClient({ graphql: gql, rest: stubRest() });
    const m = await client.getRepoMetadata("o", "r");
    expect(m.labels).toEqual([{ name: "bug", color: "e5484d" }]);
    expect(m.milestones).toEqual([{ number: 3, title: "v1" }]);
    expect(m.assignees[0]).toMatchObject({
      login: "octocat",
      name: "The Octocat",
    });
  });

  it("updateIssue / setAssignees / setMilestone call REST", async () => {
    const rest = stubRest();
    const client = new GitHubClient({ rest });
    await client.updateIssue("o", "r", 1, { title: "T", body: "B" });
    await client.setAssignees("o", "r", 1, ["maya"]);
    await client.setMilestone("o", "r", 1, 3);
    expect(rest.updateIssue).toHaveBeenCalledWith("o", "r", 1, {
      title: "T",
      body: "B",
    });
    expect(rest.setAssignees).toHaveBeenCalledWith("o", "r", 1, ["maya"]);
    expect(rest.setMilestone).toHaveBeenCalledWith("o", "r", 1, 3);
  });

  it("setMilestone(null) clears the milestone", async () => {
    const rest = stubRest();
    const client = new GitHubClient({ rest });
    await client.setMilestone("o", "r", 1, null);
    expect(rest.setMilestone).toHaveBeenCalledWith("o", "r", 1, null);
  });
});
