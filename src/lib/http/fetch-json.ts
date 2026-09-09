export class SourceFetchError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "SourceFetchError";
  }
}

export async function fetchJson<T>(
  url: string,
  options: { timeoutMs?: number; headers?: Record<string, string> } = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 20_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json, text/plain;q=0.8",
        "User-Agent": "OpTracker/1.0 (+https://github.com/mevan101/optracker)",
        ...options.headers,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new SourceFetchError(
        `Source responded ${response.status} for ${url}`,
        response.status,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof SourceFetchError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new SourceFetchError(`Timed out fetching ${url}`);
    }
    throw new SourceFetchError(
      error instanceof Error ? error.message : `Failed fetching ${url}`,
    );
  } finally {
    clearTimeout(timer);
  }
}
