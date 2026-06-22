import { describe, it, expect } from "vitest";
import { getStoredDensity, DENSITIES } from "@/lib/density";

describe("density helpers", () => {
  it("defaults to comfortable without a document", () => {
    expect(getStoredDensity()).toBe("comfortable");
  });

  it("exposes exactly the two densities", () => {
    expect(DENSITIES).toEqual(["comfortable", "compact"]);
  });
});
