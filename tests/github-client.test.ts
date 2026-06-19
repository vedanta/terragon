import { describe, it, expect, vi } from "vitest";
import { GitHubClient, isRateLimited } from "@/lib/github/client";

function node(number: number, over: Record<string, unknown> = {}) {
  return {
    number,
    title: `Issue ${number}`,
    body: "",
    state: "OPEN",
    url: `https://github.com/acme/x/issues/${number}`,
    updatedAt: "2026-01-01T00:00:00Z",
    labels: { nodes: [] },
    assignees: { nodes: [] },
    milestone: null,
    ...over,
  };
}

const page = (
  nodes: ReturnType<typeof node>[],
  hasNextPage: boolean,
  endCursor: string | null,
) => ({
  repository: { issues: { pageInfo: { hasNextPage, endCursor }, nodes } },
});

describe("GitHubClient", () => {
  it("maps a GraphQL node to RawIssue", async () => {
    const gql = vi.fn().mockResolvedValue(
      page(
        [
          node(7, {
            state: "CLOSED",
            labels: { nodes: [{ name: "bug" }, { name: "terragon/done" }] },
            assignees: {
              nodes: [{ login: "maya", name: "Maya", avatarUrl: "a" }],
            },
            milestone: { title: "v1" },
          }),
        ],
        false,
        null,
      ),
    );
    const client = new GitHubClient({ graphql: gql });
    const { items } = await client.listIssues("acme", "x");
    expect(items[0]).toMatchObject({
      number: 7,
      state: "closed",
      labels: ["bug", "terragon/done"],
      assignees: [{ login: "maya", name: "Maya", avatarUrl: "a" }],
      milestone: "v1",
    });
  });

  it("follows pagination across pages", async () => {
    const gql = vi
      .fn()
      .mockResolvedValueOnce(page([node(1), node(2)], true, "c1"))
      .mockResolvedValueOnce(page([node(3)], false, null));
    const client = new GitHubClient({ graphql: gql });
    const all = await client.listAllIssues("acme", "x");
    expect(all.map((i) => i.number)).toEqual([1, 2, 3]);
    expect(gql).toHaveBeenCalledTimes(2);
  });

  it("retries with backoff on a rate-limit error, then succeeds", async () => {
    const gql = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error("secondary rate limit"), { status: 403 }),
      )
      .mockResolvedValueOnce(page([node(1)], false, null));
    const client = new GitHubClient({
      graphql: gql,
      retry: { baseDelayMs: 0 },
    });
    const { items } = await client.listIssues("acme", "x");
    expect(items).toHaveLength(1);
    expect(gql).toHaveBeenCalledTimes(2);
  });

  it("does not retry non-rate-limit errors", async () => {
    const gql = vi.fn().mockRejectedValue(new Error("boom"));
    const client = new GitHubClient({
      graphql: gql,
      retry: { baseDelayMs: 0 },
    });
    await expect(client.listIssues("acme", "x")).rejects.toThrow("boom");
    expect(gql).toHaveBeenCalledTimes(1);
  });

  it("isRateLimited detects secondary/abuse limits", () => {
    expect(isRateLimited({ status: 403 })).toBe(true);
    expect(isRateLimited({ status: 429 })).toBe(true);
    expect(isRateLimited(new Error("API rate limit exceeded"))).toBe(true);
    expect(isRateLimited(new Error("not found"))).toBe(false);
  });
});
