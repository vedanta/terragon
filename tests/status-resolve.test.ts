import { describe, it, expect } from "vitest";
import { resolveStatus } from "@/lib/status/resolve";

const open = (labels: string[] = []) => ({ state: "open" as const, labels });

describe("resolveStatus (architecture §6)", () => {
  it("closed → done regardless of labels", () => {
    expect(resolveStatus({ state: "closed", labels: [] })).toBe("done");
    expect(
      resolveStatus({ state: "closed", labels: ["terragon/planned"] }),
    ).toBe("done");
  });

  it("exactly one terragon/* label → that status", () => {
    expect(resolveStatus(open(["terragon/in-progress"]))).toBe("in-progress");
    expect(resolveStatus(open(["terragon/backburner"]))).toBe("backburner");
  });

  it("multiple labels → precedence in-progress > planned > backburner > done", () => {
    expect(
      resolveStatus(open(["terragon/planned", "terragon/in-progress"])),
    ).toBe("in-progress");
    expect(
      resolveStatus(open(["terragon/backburner", "terragon/planned"])),
    ).toBe("planned");
    expect(resolveStatus(open(["terragon/backburner", "terragon/done"]))).toBe(
      "backburner",
    );
  });

  it("ignores non-status labels", () => {
    expect(resolveStatus(open(["bug", "terragon/done"]))).toBe("done");
  });

  it("no status label → default planned", () => {
    expect(resolveStatus(open(["bug", "feature"]))).toBe("planned");
    expect(resolveStatus(open([]))).toBe("planned");
  });

  it("honours a mapped legacy label", () => {
    const mapping = {
      planned: ["terragon/planned"],
      "in-progress": ["terragon/in-progress", "status: doing"],
      done: ["terragon/done"],
      backburner: ["terragon/backburner"],
    };
    expect(resolveStatus(open(["status: doing"]), mapping)).toBe("in-progress");
  });
});
