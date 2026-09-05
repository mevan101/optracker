import { describe, expect, it } from "vitest";
import { isActivePath } from "./active-path";

describe("isActivePath", () => {
  it("treats job detail as Discover", () => {
    expect(isActivePath("/jobs/jobicy%3A1", "/")).toBe(true);
    expect(isActivePath("/jobs/jobicy%3A1", "/pulse")).toBe(false);
  });

  it("matches boards and pulse without stealing Discover", () => {
    expect(isActivePath("/platforms", "/platforms")).toBe(true);
    expect(isActivePath("/platforms", "/")).toBe(false);
    expect(isActivePath("/pulse", "/pulse")).toBe(true);
  });
});
