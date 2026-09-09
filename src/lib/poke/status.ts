import { mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pokeStatusFilePath } from "@/lib/store/paths";

const DEFAULT_PATH = pokeStatusFilePath();

export type PokeBriefKind = "pulse" | "role" | "test" | "deploy";

export interface PokeLastSend {
  at: string;
  ok: boolean;
  kind: PokeBriefKind;
  summary: string;
  error?: string;
}

export interface PokeStatusFile {
  last: PokeLastSend | null;
}

function emptyStatus(): PokeStatusFile {
  return { last: null };
}

export function readPokeStatus(filePath = DEFAULT_PATH): PokeStatusFile {
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as PokeStatusFile;
    if (!parsed || typeof parsed !== "object") {
      return emptyStatus();
    }
    return { last: parsed.last ?? null };
  } catch {
    return emptyStatus();
  }
}

export function writePokeStatus(status: PokeStatusFile, filePath = DEFAULT_PATH): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tempPath, `${JSON.stringify(status, null, 2)}\n`, "utf8");
  try {
    renameSync(tempPath, filePath);
  } catch (error) {
    try {
      unlinkSync(tempPath);
    } catch {
      // Best-effort temp cleanup.
    }
    throw error;
  }
}

export function recordPokeSend(last: PokeLastSend, filePath = DEFAULT_PATH): PokeStatusFile {
  const next = { last };
  writePokeStatus(next, filePath);
  return next;
}

export function defaultPokeStatusPath(): string {
  return DEFAULT_PATH;
}
