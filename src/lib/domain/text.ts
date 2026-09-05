const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) => {
      const key = entity.toLowerCase();
      if (key.startsWith("#x")) {
        const code = Number.parseInt(key.slice(2), 16);
        return Number.isFinite(code) ? String.fromCodePoint(code) : "";
      }
      if (key.startsWith("#")) {
        const code = Number.parseInt(key.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : "";
      }
      return ENTITY_MAP[key] ?? "";
    })
    .replace(/\s+/g, " ")
    .trim();
}

export function excerptFrom(text: string, max = 180): string {
  const clean = stripHtml(text);
  if (clean.length <= max) {
    return clean;
  }
  return `${clean.slice(0, max).trimEnd()}…`;
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function utcDay(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, to = new Date()): number {
  const from = Date.parse(fromIso);
  if (Number.isNaN(from)) {
    return Number.POSITIVE_INFINITY;
  }
  return (to.getTime() - from) / 86_400_000;
}

export function fromEpochSeconds(value: unknown): string | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  const ms = n > 1e12 ? n : n * 1000;
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function parseDate(value: unknown): string | null {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value === "number") {
    return fromEpochSeconds(value);
  }
  const text = String(value).trim();
  if (!text) {
    return null;
  }
  if (/^\d{9,13}$/.test(text)) {
    return fromEpochSeconds(Number(text));
  }
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function formatRelative(iso: string | null, now = new Date()): string {
  if (!iso) {
    return "Date unknown";
  }
  const then = Date.parse(iso);
  if (Number.isNaN(then)) {
    return "Date unknown";
  }
  const delta = now.getTime() - then;
  const minutes = Math.round(delta / 60_000);
  if (Math.abs(minutes) < 1) {
    return "Just now";
  }
  if (Math.abs(minutes) < 60) {
    return `${Math.abs(minutes)}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return `${Math.abs(hours)}h ago`;
  }
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) {
    return `${Math.abs(days)}d ago`;
  }
  return new Date(then).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function companyInitials(company: string): string {
  const parts = company
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z0-9]/g, ""))
    .filter(Boolean);
  if (parts.length === 0) {
    return "•";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
