import { afterEach, describe, expect, it, vi } from "vitest";
import { emptyIntegrityStats } from "@/lib/domain/types";
import { sampleBudget, sampleListings } from "@/lib/client/test-fixtures";

vi.mock("./status", () => ({
  recordPokeSend: vi.fn(),
}));

describe("Poke inbound client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("does not call poke.com when no key is configured", async () => {
    vi.stubEnv("POKE_API_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { notifyPulse } = await import("./client");
    const result = await notifyPulse({
      platformName: "Remotive",
      stats: { ...emptyIntegrityStats(), accepted: 4 },
      budget: sampleBudget,
      listings: sampleListings,
    });
    expect(result).toEqual({ configured: false, sent: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts a Kitchen V2 inbound message when a pulse kept roles", async () => {
    vi.stubEnv("POKE_API_KEY", "kitchen-key");
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ success: true }) }));
    vi.stubGlobal("fetch", fetchMock);
    const { notifyPulse } = await import("./client");
    const result = await notifyPulse({
      platformName: "Remotive",
      stats: { ...emptyIntegrityStats(), fetched: 10, accepted: 2 },
      budget: sampleBudget,
      listings: sampleListings,
    });
    expect(result.configured).toBe(true);
    expect(result.sent).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://poke.com/api/v1/inbound/api-message",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer kitchen-key",
        }),
        body: expect.stringMatching(/OpTracker just pulsed Remotive[\s\S]*Do not apply/),
      }),
    );
  });

  it("skips an empty pulse so Poke is not spammed", async () => {
    vi.stubEnv("POKE_API_KEY", "kitchen-key");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { notifyPulse } = await import("./client");
    const result = await notifyPulse({
      platformName: "Remotive",
      stats: emptyIntegrityStats(),
      budget: sampleBudget,
      listings: [],
    });
    expect(result).toMatchObject({ configured: true, sent: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
