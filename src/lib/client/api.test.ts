import { describe, expect, it } from "vitest";
import { formatIntegrity } from "./api";

describe("formatIntegrity", () => {
  it("keeps the original pulse summary copy", () => {
    expect(formatIntegrity()).toBe("No pulse yet");
    expect(
      formatIntegrity({
        fetched: 10,
        accepted: 4,
        expired: 2,
        broken: 1,
        mock: 1,
        placeholder: 1,
        untrusted_platform: 0,
        duplicate: 1,
        invalid: 0,
      }),
    ).toBe("4 kept · 6 filtered");
  });
});
