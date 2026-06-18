import { describe, it, expect } from "vitest";
import {
  ISSUES,
  STATUS_ORDER,
  PEOPLE,
  LABELS,
  MILESTONES,
} from "@/fixtures/seed";

describe("seed fixtures", () => {
  it("has 16 issues", () => {
    expect(ISSUES.length).toBe(16);
  });

  it("every issue has a known status", () => {
    for (const issue of ISSUES) {
      expect(STATUS_ORDER).toContain(issue.status);
    }
  });

  it("every assignee references a known person", () => {
    for (const issue of ISSUES) {
      if (issue.assignee) {
        expect(Object.keys(PEOPLE)).toContain(issue.assignee);
      }
    }
  });

  it("every label references a known label", () => {
    for (const issue of ISSUES) {
      for (const label of issue.labels) {
        expect(Object.keys(LABELS)).toContain(label);
      }
    }
  });

  it("every milestone is either null or known", () => {
    for (const issue of ISSUES) {
      if (issue.milestone) {
        expect(MILESTONES).toContain(issue.milestone);
      }
    }
  });
});
