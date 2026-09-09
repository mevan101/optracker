import path from "node:path";

export function runtimeDataDir(): string {
  const override = process.env.OPTRACKER_DATA_DIR?.trim();
  if (override) {
    return override;
  }
  if (process.env.VERCEL) {
    return path.join("/tmp", "optracker");
  }
  return path.join(process.cwd(), "data");
}

export function catalogFilePath(): string {
  return path.join(runtimeDataDir(), "catalog.json");
}

export function pokeStatusFilePath(): string {
  return path.join(runtimeDataDir(), "poke-status.json");
}
