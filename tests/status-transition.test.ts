import { describe, it, expect } from "vitest";
import { transitionPlan } from "@/lib/status/transition";

describe("transitionPlan (architecture §6/§7)", () => {
  it("adds the target label and removes the others", () => {
    const p = transitionPlan("planned", "in-progress", { autoCloseDone: true });
    expect(p.addLabel).toBe("terragon/in-progress");
    expect(p.removeLabels).toEqual([
      "terragon/planned",
      "terragon/done",
      "terragon/backburner",
    ]);
  });

  it("closes when moving to Done and auto-close is on", () => {
    expect(
      transitionPlan("in-progress", "done", { autoCloseDone: true }).close,
    ).toBe(true);
    expect(
      transitionPlan("in-progress", "done", { autoCloseDone: false }).close,
    ).toBe(false);
  });

  it("reopens when leaving Done and auto-close is on", () => {
    expect(
      transitionPlan("done", "planned", { autoCloseDone: true }).reopen,
    ).toBe(true);
    expect(
      transitionPlan("done", "planned", { autoCloseDone: false }).reopen,
    ).toBe(false);
  });

  it("does not reopen when not coming from Done", () => {
    expect(
      transitionPlan("planned", "backburner", { autoCloseDone: true }).reopen,
    ).toBe(false);
  });
});
