import { mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readCatalog, writeCatalog } from "./persistence";

describe("catalog persistence", () => {
  it("writes atomically and reads the snapshot back", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "optracker-store-"));
    const filePath = path.join(dir, "catalog.json");
    const snapshot = readCatalog(filePath);
    snapshot.budget.used = 2;
    snapshot.budget.date = "2026-09-05";
    writeCatalog(snapshot, filePath);

    expect(readCatalog(filePath).budget.used).toBe(2);
    expect(readdirSync(dir).some((name) => name.endsWith(".tmp"))).toBe(false);
  });

  it("returns an empty catalog when the file is corrupt", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "optracker-store-"));
    const filePath = path.join(dir, "catalog.json");
    writeFileSync(filePath, "{not-json", "utf8");
    expect(readCatalog(filePath).listings).toEqual([]);
    expect(readCatalog(filePath).budget.used).toBe(0);
  });
});
