"use client";

import { useSyncExternalStore } from "react";

export const SAVED_KEY = "optracker:saved";
export const SAVED_EVENT = "optracker:saved";
const EMPTY_IDS: string[] = [];
let snapshot: string[] = EMPTY_IDS;

function parseSavedIds(): string[] {
  if (typeof window === "undefined") {
    return EMPTY_IDS;
  }
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : EMPTY_IDS;
  } catch {
    return EMPTY_IDS;
  }
}

function sameIds(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

export function readSavedIds(): string[] {
  const next = parseSavedIds();
  if (sameIds(snapshot, next)) {
    return snapshot;
  }
  snapshot = next.length === 0 ? EMPTY_IDS : next;
  return snapshot;
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

export function useSavedIds(): string[] {
  return useSyncExternalStore(onSavedChanged, readSavedIds, () => EMPTY_IDS);
}

export function useIsSaved(id: string): boolean {
  return useSavedIds().includes(id);
}
