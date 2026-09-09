import type { JobsResponse } from "@/lib/client/api";

export const CATALOG_EVENT = "optracker:catalog";
const SNAPSHOT_KEY = "optracker:jobs";
const CHANNEL_NAME = "optracker-catalog";

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
}

export function readJobsSnapshot(): JobsResponse | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(SNAPSHOT_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as JobsResponse;
    if (!parsed || !Array.isArray(parsed.listings)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveJobsSnapshot(data: JobsResponse): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(data));
  } catch {
    // Quota or private mode — live fetch still works.
  }
}

export function publishJobsSnapshot(data: JobsResponse): void {
  saveJobsSnapshot(data);
  emitCatalogChanged();
}

export function emitCatalogChanged(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(CATALOG_EVENT));
  getChannel()?.postMessage(CATALOG_EVENT);
}

export function catalogTimestamp(data: JobsResponse | null | undefined): number {
  if (!data?.updatedAt) {
    return 0;
  }
  const time = Date.parse(data.updatedAt);
  return Number.isFinite(time) ? time : 0;
}

export function preferFresherCatalog(
  current: JobsResponse,
  incoming: JobsResponse,
): JobsResponse {
  const currentTs = catalogTimestamp(current);
  const incomingTs = catalogTimestamp(incoming);
  if (incomingTs < currentTs) {
    return current;
  }
  return incoming;
}

export function onCatalogChanged(listener: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onVisible = () => {
    if (document.visibilityState === "visible") {
      listener();
    }
  };
  const onMessage = () => listener();
  const ch = getChannel();

  window.addEventListener(CATALOG_EVENT, listener);
  window.addEventListener("focus", listener);
  document.addEventListener("visibilitychange", onVisible);
  ch?.addEventListener("message", onMessage);

  return () => {
    window.removeEventListener(CATALOG_EVENT, listener);
    window.removeEventListener("focus", listener);
    document.removeEventListener("visibilitychange", onVisible);
    ch?.removeEventListener("message", onMessage);
  };
}
