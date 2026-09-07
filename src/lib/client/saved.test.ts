/** @vitest-environment happy-dom */

import { describe, expect, it, vi } from "vitest";
import { onSavedChanged, readSavedIds, SAVED_KEY, toggleSaved, writeSavedIds } from "./saved";

describe("saved bookmarks", () => {
  it("keeps the v1 localStorage key and notifies listeners", () => {
    localStorage.clear();
    const listener = vi.fn();
    const stop = onSavedChanged(listener);

    expect(readSavedIds()).toEqual([]);
    expect(toggleSaved("jobicy:1")).toEqual(["jobicy:1"]);
    expect(localStorage.getItem(SAVED_KEY)).toContain("jobicy:1");
    expect(toggleSaved("jobicy:1")).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(2);

    writeSavedIds(["a", "a", "b"]);
    expect(readSavedIds()).toEqual(["a", "b"]);
    stop();
  });
});
