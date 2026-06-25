import { describe, it, expect } from "vitest";
import { describeRepoAccess } from "@/lib/repo-access";

describe("describeRepoAccess", () => {
  it("owned writable personal repo → no badges", () => {
    expect(
      describeRepoAccess(
        { owner: "joe", ownerType: "User", canWrite: true },
        "joe",
      ),
    ).toEqual({ owned: true, readOnly: false, relation: null });
  });

  it("another user's repo → collaborator", () => {
    expect(
      describeRepoAccess(
        { owner: "joe", ownerType: "User", canWrite: true },
        "bill",
      ),
    ).toMatchObject({ owned: false, relation: "collaborator" });
  });

  it("org-owned repo → org (even for a member)", () => {
    expect(
      describeRepoAccess(
        { owner: "acme", ownerType: "Organization", canWrite: true },
        "bill",
      ),
    ).toMatchObject({ owned: false, relation: "org" });
  });

  it("no push access → readOnly", () => {
    const a = describeRepoAccess(
      { owner: "joe", ownerType: "User", canWrite: false },
      "bill",
    );
    expect(a.readOnly).toBe(true);
    expect(a.relation).toBe("collaborator");
  });
});
