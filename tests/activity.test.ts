import { describe, it, expect } from "vitest";
import { describeActivity } from "@/lib/activity-format";

describe("describeActivity", () => {
  it("summarizes a grooming batch", () => {
    const d = describeActivity(
      "batch_update",
      JSON.stringify({ count: 6, updated: 5, failed: 1 }),
    );
    expect(d.title).toBe("Groomed 6 issues");
    expect(d.detail).toBe("5 updated, 1 failed");
  });

  it("singularizes one issue and omits failures when none", () => {
    const d = describeActivity(
      "batch_update",
      JSON.stringify({ count: 1, updated: 1, failed: 0 }),
    );
    expect(d.title).toBe("Groomed 1 issue");
    expect(d.detail).toBe("1 updated");
  });

  it("renders a status change with human labels", () => {
    const d = describeActivity(
      "status_change",
      JSON.stringify({ issue: 142, from: "planned", to: "in-progress" }),
    );
    expect(d.title).toBe("#142 → In Progress");
    expect(d.detail).toBe("from Planned");
  });

  it("renders a created issue", () => {
    const d = describeActivity(
      "issue_created",
      JSON.stringify({ number: 200, status: "done" }),
    );
    expect(d.title).toBe("Created #200");
    expect(d.detail).toBe("as Done");
  });

  it("tolerates malformed/unknown payloads", () => {
    expect(describeActivity("batch_update", "not json").title).toBe(
      "Groomed 0 issues",
    );
    expect(describeActivity("mystery", null)).toEqual({
      title: "mystery",
      detail: null,
    });
  });
});
