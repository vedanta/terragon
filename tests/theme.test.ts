import { describe, it, expect } from "vitest";
import { resolveTheme, getStoredMode, THEME_MODES } from "@/lib/theme";

describe("theme helpers", () => {
  it("resolveTheme passes through explicit modes", () => {
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("resolveTheme('system') yields a concrete theme", () => {
    // No window in the node test env → falls back to light.
    expect(["light", "dark"]).toContain(resolveTheme("system"));
  });

  it("getStoredMode defaults to system without a window", () => {
    expect(getStoredMode()).toBe("system");
  });

  it("exposes exactly the three modes", () => {
    expect(THEME_MODES).toEqual(["light", "dark", "system"]);
  });
});
