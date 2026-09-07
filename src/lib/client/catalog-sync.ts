export const CATALOG_EVENT = "optracker:catalog";

export function emitCatalogChanged(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(CATALOG_EVENT));
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

  window.addEventListener(CATALOG_EVENT, listener);
  window.addEventListener("focus", listener);
  document.addEventListener("visibilitychange", onVisible);

  return () => {
    window.removeEventListener(CATALOG_EVENT, listener);
    window.removeEventListener("focus", listener);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
