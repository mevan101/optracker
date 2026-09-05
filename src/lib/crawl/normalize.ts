import { getPlatform } from "@/lib/domain/platforms";
import { excerptFrom, normalizeWhitespace, parseDate } from "@/lib/domain/text";
import { inferWorkMode } from "@/lib/domain/validation";
import type { JobListing } from "@/lib/domain/types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string {
  if (typeof value === "string") {
    return normalizeWhitespace(value);
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return "";
}

function stringList(value: unknown): string[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((item) => text(item)).filter(Boolean).slice(0, 12);
  }
  return text(value)
    .split(/[,|]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function salaryFromRange(min: unknown, max: unknown): string | null {
  const low = typeof min === "number" ? min : Number(min);
  const high = typeof max === "number" ? max : Number(max);
  if (Number.isFinite(low) && Number.isFinite(high) && low > 0 && high > 0) {
    return `$${Math.round(low / 1000)}k–$${Math.round(high / 1000)}k`;
  }
  return null;
}

function listingId(platformId: string, sourceId: string): string {
  return `${platformId}:${sourceId}`;
}

function withPlatform(
  platformId: string,
  partial: Omit<JobListing, "id" | "platformId" | "platformName"> & {
    sourceRecordId: string;
  },
): JobListing | null {
  const platform = getPlatform(platformId);
  if (!platform) {
    return null;
  }
  return {
    id: listingId(platformId, partial.sourceRecordId),
    platformId,
    platformName: platform.name,
    ...partial,
  };
}

export function normalizeRemoteOk(raw: unknown): JobListing | null {
  const row = asRecord(raw);
  if (!row || !row.position || !row.company) {
    return null;
  }
  const sourceRecordId = text(row.id || row.slug);
  if (!sourceRecordId) {
    return null;
  }
  const location = text(row.location) || "Remote";
  return withPlatform("remoteok", {
    sourceRecordId,
    title: text(row.position),
    company: text(row.company),
    location,
    workMode: inferWorkMode(location, true),
    url: text(row.url || row.apply_url),
    postedAt: parseDate(row.date) ?? parseDate(row.epoch),
    expiresAt: null,
    tags: stringList(row.tags),
    salary: salaryFromRange(row.salary_min, row.salary_max),
    excerpt: excerptFrom(text(row.description)),
  });
}

export function normalizeRemotive(raw: unknown): JobListing | null {
  const row = asRecord(raw);
  if (!row) {
    return null;
  }
  const sourceRecordId = text(row.id);
  if (!sourceRecordId) {
    return null;
  }
  const location = text(row.candidate_required_location) || "Remote";
  return withPlatform("remotive", {
    sourceRecordId,
    title: text(row.title),
    company: text(row.company_name),
    location,
    workMode: inferWorkMode(location, true),
    url: text(row.url),
    postedAt: parseDate(row.publication_date),
    expiresAt: null,
    tags: stringList(row.tags).concat(stringList(row.category)).slice(0, 12),
    salary: text(row.salary) || null,
    excerpt: excerptFrom(text(row.description)),
  });
}

export function normalizeArbeitnow(raw: unknown): JobListing | null {
  const row = asRecord(raw);
  if (!row) {
    return null;
  }
  const sourceRecordId = text(row.slug);
  if (!sourceRecordId) {
    return null;
  }
  const location = text(row.location) || (row.remote ? "Remote" : "Unknown");
  return withPlatform("arbeitnow", {
    sourceRecordId,
    title: text(row.title),
    company: text(row.company_name),
    location,
    workMode: inferWorkMode(location, Boolean(row.remote)),
    url: text(row.url),
    postedAt: parseDate(row.created_at),
    expiresAt: null,
    tags: stringList(row.tags).concat(stringList(row.job_types)).slice(0, 12),
    salary: null,
    excerpt: excerptFrom(text(row.description)),
  });
}

export function normalizeJobicy(raw: unknown): JobListing | null {
  const row = asRecord(raw);
  if (!row) {
    return null;
  }
  const sourceRecordId = text(row.id || row.jobSlug);
  if (!sourceRecordId) {
    return null;
  }
  const location = text(row.jobGeo) || "Remote";
  return withPlatform("jobicy", {
    sourceRecordId,
    title: text(row.jobTitle),
    company: text(row.companyName),
    location,
    workMode: inferWorkMode(location, true),
    url: text(row.url),
    postedAt: parseDate(row.pubDate),
    expiresAt: parseDate(row.expiryDate),
    tags: stringList(row.jobIndustry)
      .concat(stringList(row.jobType), stringList(row.jobLevel))
      .slice(0, 12),
    salary: text(row.salary) || null,
    excerpt: excerptFrom(text(row.jobExcerpt || row.jobDescription)),
  });
}

export function unwrapSourceRows(payload: unknown, platformId: string): unknown[] {
  if (platformId === "remoteok" && Array.isArray(payload)) {
    return payload;
  }
  const record = asRecord(payload);
  if (!record) {
    return [];
  }
  if (platformId === "remotive" && Array.isArray(record.jobs)) {
    return record.jobs;
  }
  if (platformId === "arbeitnow" && Array.isArray(record.data)) {
    return record.data;
  }
  if (platformId === "jobicy" && Array.isArray(record.jobs)) {
    return record.jobs;
  }
  return [];
}

export function normalizeSourceRow(
  platformId: string,
  raw: unknown,
): JobListing | null {
  switch (platformId) {
    case "remoteok":
      return normalizeRemoteOk(raw);
    case "remotive":
      return normalizeRemotive(raw);
    case "arbeitnow":
      return normalizeArbeitnow(raw);
    case "jobicy":
      return normalizeJobicy(raw);
    default:
      return null;
  }
}
