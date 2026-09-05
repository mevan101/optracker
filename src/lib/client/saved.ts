const KEY = "optracker:saved";

export function readSavedIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function writeSavedIds(ids: string[]): void {
  window.localStorage.setItem(KEY, JSON.stringify([...new Set(ids)]));
}

export function toggleSaved(id: string): string[] {
  const current = readSavedIds();
  const next = current.includes(id)
    ? current.filter((item) => item !== id)
    : [id, ...current];
  writeSavedIds(next);
  return next;
}
