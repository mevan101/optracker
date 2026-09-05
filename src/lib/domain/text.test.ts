import { describe, expect, it } from "vitest";
import { companyInitials, excerptFrom, stripHtml, utcDay } from "./text";

describe("text helpers", () => {
  it("strips markup and entities", () => {
    expect(stripHtml("<p>Hello&nbsp;<strong>world</strong></p>")).toBe("Hello world");
  });

  it("builds excerpts and initials", () => {
    expect(excerptFrom("a".repeat(200)).endsWith("…")).toBe(true);
    expect(companyInitials("Remote OK")).toBe("RO");
  });

  it("prints a UTC day key", () => {
    expect(utcDay(new Date("2026-09-05T23:30:00Z"))).toBe("2026-09-05");
  });
});
