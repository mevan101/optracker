export const SAVED_KEY = "optracker:saved";
export const SAVED_EVENT = "optracker:saved";

export function readSavedIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function writeSavedIds(ids: string[]): void {
  window.localStorage.setItem(SAVED_KEY, JSON.stringify([...new Set(ids)]));
  window.dispatchEvent(new Event(SAVED_EVENT));
}

export function toggleSaved(id: string): string[] {
  const current = readSavedIds();
  const next = current.includes(id)
    ? current.filter((item) => item !== id)
    : [id, ...current];
  writeSavedIds(next);
  return next;
}

export function onSavedChanged(listener: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener(SAVED_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(SAVED_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
