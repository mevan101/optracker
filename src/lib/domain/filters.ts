import { daysBetween } from "./text";
import { MAX_LISTING_AGE_DAYS, type JobListing, type RejectionReason } from "./types";
import { isBlockedHost, isHttpUrl } from "./validation";

const EXPIRED_PATTERN =
  /\b(no longer (accepting|available)|position (has been )?filled|job (has )?expired|listing (has )?expired|this role is closed|applications? closed|no longer posted)\b/i;

const MOCK_PATTERN =
  /\b(lorem ipsum|dummy(?:\s+job)?|mock(?:\s+job|\s+listing)?|fake (?:job|company|listing)|acme(?:\s+corp(?:oration)?)?|foo\s+bar|hello world|test(?:ing)?(?:\s+job|\s+listing)?|sample (?:job|company|listing)|your company|job title here|n\/a)\b/i;

const PLACEHOLDER_PATTERN =
  /\b(placeholder|tbd|coming soon|lorem|ipsum|xxx+|todo|fixme|example company|example job|untitled)\b/i;

const BROKEN_TITLE_PATTERN = /^(n\/a|-|—|–|\.|null|undefined)$/i;

export function looksExpired(
  listing: Pick<JobListing, "title" | "excerpt" | "expiresAt" | "postedAt">,
  now = new Date(),
  maxAgeDays = MAX_LISTING_AGE_DAYS,
): boolean {
  if (listing.expiresAt) {
    const expires = Date.parse(listing.expiresAt);
    if (!Number.isNaN(expires) && expires < now.getTime()) {
      return true;
    }
  }

  if (listing.postedAt && daysBetween(listing.postedAt, now) > maxAgeDays) {
    return true;
  }

  const haystack = `${listing.title} ${listing.excerpt}`;
  return EXPIRED_PATTERN.test(haystack);
}

export function looksMock(listing: Pick<JobListing, "title" | "company" | "excerpt" | "id">): boolean {
  if (listing.id.startsWith("mock-") || listing.id.includes(":mock:")) {
    return true;
  }
  const haystack = `${listing.title} ${listing.company} ${listing.excerpt}`;
  return MOCK_PATTERN.test(haystack);
}

export function looksPlaceholder(
  listing: Pick<JobListing, "title" | "company" | "excerpt" | "url">,
): boolean {
  if (/placeholder|example\.com|dummy/i.test(listing.url)) {
    return true;
  }
  const haystack = `${listing.title} ${listing.company} ${listing.excerpt}`;
  return PLACEHOLDER_PATTERN.test(haystack);
}

export function looksBroken(
  listing: Pick<JobListing, "title" | "company" | "url">,
): boolean {
  if (!isHttpUrl(listing.url) || isBlockedHost(listing.url)) {
    return true;
  }
  if (BROKEN_TITLE_PATTERN.test(listing.title.trim())) {
    return true;
  }
  if (listing.company.trim().length < 2) {
    return true;
  }
  return false;
}

export function classifyListing(
  listing: JobListing,
  now = new Date(),
): RejectionReason | null {
  if (looksBroken(listing)) {
    return "broken";
  }
  if (looksMock(listing)) {
    return "mock";
  }
  if (looksPlaceholder(listing)) {
    return "placeholder";
  }
  if (looksExpired(listing, now)) {
    return "expired";
  }
  return null;
}
