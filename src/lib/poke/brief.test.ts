import { describe, expect, it } from "vitest";
import { sampleBudget, sampleListings } from "@/lib/client/test-fixtures";
import { emptyIntegrityStats } from "@/lib/domain/types";
import { buildPulseBrief, buildRoleBrief, buildTestBrief, buildDeployBrief } from "./brief";

describe("Poke briefs", () => {
  it("names the pulsed board, keeps original URLs, and forbids applying", () => {
    const stats = { ...emptyIntegrityStats(), fetched: 20, accepted: 2, mock: 1 };
    const message = buildPulseBrief({
      platformName: "Remotive",
      stats,
      budget: sampleBudget,
      listings: sampleListings,
    });

    expect(message).toContain("OpTracker just pulsed Remotive.");
    expect(message).toContain("2 live roles");
    expect(message).toContain("https://jobicy.com/jobs/jobicy:1");
    expect(message).toContain("Do not apply");
    expect(message).toContain("4 of 5 remaining");
  });

  it("sends a single role without inventing fields", () => {
    const message = buildRoleBrief(sampleListings[0]!);
    expect(message).toContain("Support Engineer");
    expect(message).toContain("Roboflow");
    expect(message).toContain("https://jobicy.com/jobs/jobicy:1");
    expect(message).toContain("Do not apply");
    expect(message).not.toContain("lorem");
  });

  it("keeps the test ping inert", () => {
    const message = buildTestBrief();
    expect(message).toContain("test ping");
    expect(message).toContain("Do not create calendar events");
  });

  it("asks Poke to host a permanent Vercel URL from the GitHub repo", () => {
    const message = buildDeployBrief();
    expect(message).toContain("https://github.com/mevan101/optracker");
    expect(message).toContain("cursor/poke-sync-flawless-7446");
    expect(message).toContain("https://github.com/mevan101/optracker/pull/3");
    expect(message).toContain("Vercel");
    expect(message).toContain("Do not use an anonymous 60-minute Vercel claim link");
    expect(message).toContain("/mcp");
  });
});
