/** @vitest-environment happy-dom */

import { describe, expect, it, vi } from "vitest";
import { CATALOG_EVENT, emitCatalogChanged, onCatalogChanged } from "./catalog-sync";

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
