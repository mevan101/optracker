/** @vitest-environment happy-dom */

import { describe, expect, it, vi } from "vitest";
import { CATALOG_EVENT, emitCatalogChanged, onCatalogChanged, preferFresherCatalog } from "./catalog-sync";
import { jobsResponse, listing } from "./test-fixtures";

describe("catalog sync", () => {
  it("notifies subscribers when a pulse lands", () => {
    const listener = vi.fn();
    const stop = onCatalogChanged(listener);
    emitCatalogChanged();
    expect(listener).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event(CATALOG_EVENT));
    expect(listener).toHaveBeenCalledTimes(2);
    stop();
    emitCatalogChanged();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("keeps a live pulse instead of a stale server snapshot", () => {
    const live = jobsResponse([listing({ id: "jobicy:9", title: "New Role", company: "Vercel" })]);
    live.updatedAt = "2026-09-08T13:19:06.698Z";
    const stale = jobsResponse();
    stale.updatedAt = "2026-09-07T01:00:00.000Z";
    expect(preferFresherCatalog(live, stale).updatedAt).toBe(live.updatedAt);
    expect(preferFresherCatalog(stale, live).updatedAt).toBe(live.updatedAt);
  });
});

describe("catalog sync", () => {
  it("notifies subscribers when a pulse lands", () => {
    const listener = vi.fn();
    const stop = onCatalogChanged(listener);
    emitCatalogChanged();
    expect(listener).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event(CATALOG_EVENT));
    expect(listener).toHaveBeenCalledTimes(2);
    stop();
    emitCatalogChanged();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
