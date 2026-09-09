import { describe, expect, it, vi } from "vitest";
import path from "node:path";

describe("runtime data paths", () => {
  it("uses /tmp on Vercel so pulses can write", async () => {
    vi.resetModules();
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("OPTRACKER_DATA_DIR", "");
    const { catalogFilePath, pokeStatusFilePath, runtimeDataDir } = await import("./paths");
    expect(runtimeDataDir()).toBe(path.join("/tmp", "optracker"));
    expect(catalogFilePath()).toBe(path.join("/tmp", "optracker", "catalog.json"));
    expect(pokeStatusFilePath()).toBe(path.join("/tmp", "optracker", "poke-status.json"));
    vi.unstubAllEnvs();
  });
});
