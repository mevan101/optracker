import { z } from "zod";
import { isAllowedPlatform } from "./platforms";
import type { JobListing, WorkMode } from "./types";

const BLOCKED_HOSTS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "localhost",
  "invalid",
  "test",
  "placeholder.local",
]);

export const workModeSchema = z.enum(["remote", "hybrid", "onsite", "unknown"]);

export const jobListingSchema = z.object({
  id: z.string().min(3),
  platformId: z.string().min(2),
  platformName: z.string().min(2),
  title: z.string().min(3).max(180),
  company: z.string().min(2).max(120),
  location: z.string().min(1).max(160),
  workMode: workModeSchema,
  url: z.url(),
  postedAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime().nullable(),
  tags: z.array(z.string().min(1).max(40)).max(12),
  salary: z.string().min(1).max(80).nullable(),
  excerpt: z.string().max(280),
  sourceRecordId: z.string().min(1),
});

export type RawListingInput = z.input<typeof jobListingSchema>;

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isBlockedHost(value: string): boolean {
  try {
    const host = new URL(value).hostname.toLowerCase();
    if (host === "127.0.0.1" || host.endsWith(".localhost")) {
      return true;
    }
    return [...BLOCKED_HOSTS].some(
      (blocked) => host === blocked || host.endsWith(`.${blocked}`),
    );
  } catch {
    return true;
  }
}

export function canonicalizeUrl(value: string): string {
  const url = new URL(value);
  url.hash = "";
  [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "fbclid",
    "gclid",
  ].forEach((key) => url.searchParams.delete(key));
  url.hostname = url.hostname.toLowerCase();
  url.protocol = url.protocol.toLowerCase();
  let href = url.toString();
  if (href.endsWith("/") && url.pathname === "/") {
    href = href.slice(0, -1);
  }
  return href;
}

export function validateListing(
  input: unknown,
): { ok: true; listing: JobListing } | { ok: false; reason: "invalid" } {
  const parsed = jobListingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, reason: "invalid" };
  }

  const listing = parsed.data;
  if (!isAllowedPlatform(listing.platformId)) {
    return { ok: false, reason: "invalid" };
  }
  if (!isHttpUrl(listing.url) || isBlockedHost(listing.url)) {
    return { ok: false, reason: "invalid" };
  }

  return {
    ok: true,
    listing: {
      ...listing,
      url: canonicalizeUrl(listing.url),
      tags: listing.tags.map((tag) => tag.trim()).filter(Boolean),
    },
  };
}

export function inferWorkMode(
  location: string,
  remoteFlag?: boolean | null,
): WorkMode {
  if (remoteFlag === true) {
    return "remote";
  }
  const text = location.toLowerCase();
  if (/\bhybrid\b/.test(text)) {
    return "hybrid";
  }
  if (/\b(on[- ]?site|in[- ]office)\b/.test(text)) {
    return "onsite";
  }
  if (/\b(remote|worldwide|anywhere|distributed|work from home|wfh)\b/.test(text)) {
    return "remote";
  }
  if (remoteFlag === false) {
    return "onsite";
  }
  return location.trim() ? "unknown" : "remote";
}
