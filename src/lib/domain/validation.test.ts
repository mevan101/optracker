import { describe, expect, it } from "vitest";
import { canonicalizeUrl, inferWorkMode, validateListing } from "./validation";

function validListing(overrides: Record<string, unknown> = {}) {
  return {
    id: "remoteok:123",
    platformId: "remoteok",
    platformName: "Remote OK",
    title: "Staff Engineer",
    company: "Northwind",
    location: "Remote",
    workMode: "remote",
    url: "https://remoteok.com/remote-jobs/staff-engineer-123",
    postedAt: "2026-09-01T12:00:00.000Z",
    expiresAt: null,
    tags: ["engineering"],
    salary: "$180k–$210k",
    excerpt: "Build the core platform.",
    sourceRecordId: "123",
    ...overrides,
  };
}

describe("validateListing", () => {
  it("accepts a complete real-looking listing", () => {
    const result = validateListing(validListing());
    expect(result.ok).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = validateListing(validListing({ title: "ab", company: "" }));
    expect(result.ok).toBe(false);
  });

  it("rejects example.com and localhost urls", () => {
    expect(validateListing(validListing({ url: "https://example.com/job" })).ok).toBe(
      false,
    );
    expect(
      validateListing(validListing({ url: "http://localhost:3000/job" })).ok,
    ).toBe(false);
  });

  it("rejects unknown platforms", () => {
    const result = validateListing(
      validListing({ platformId: "made-up-board", id: "made-up-board:1" }),
    );
    expect(result.ok).toBe(false);
  });

  it("canonicalizes tracking parameters", () => {
    const url = canonicalizeUrl(
      "https://RemoteOK.com/remote-jobs/x?utm_source=x&keep=1#hash",
    );
    expect(url).toContain("keep=1");
    expect(url).not.toContain("utm_source");
    expect(url).not.toContain("#hash");
    expect(url.startsWith("https://remoteok.com")).toBe(true);
  });

  it("infers work mode from location text", () => {
    expect(inferWorkMode("Berlin · Hybrid", false)).toBe("hybrid");
    expect(inferWorkMode("Worldwide", false)).toBe("remote");
    expect(inferWorkMode("New York, NY", false)).toBe("onsite");
  });
});
