import { formatRelative, polishExcerpt, workModeLabel } from "@/lib/domain/text";
import type { CrawlBudget, IntegrityStats, JobListing } from "@/lib/domain/types";

export const BRIEF_ROLE_LIMIT = 8;

function lineForListing(listing: JobListing, index: number): string {
  const mode = workModeLabel(listing.workMode);
  const where = [listing.location, mode].filter(Boolean).join(" · ");
  const posted = listing.postedAt ? formatRelative(listing.postedAt) : "date unknown";
  return `${index + 1}. ${listing.title} at ${listing.company} — ${where || "location unknown"} — posted ${posted}\n   ${listing.url}`;
}

export function buildPulseBrief(input: {
  platformName: string;
  stats: IntegrityStats;
  budget: Pick<CrawlBudget, "remaining" | "limit">;
  listings: JobListing[];
}): string {
  const fromBoard = input.listings.filter((listing) => listing.platformName === input.platformName);
  const ranked = (fromBoard.length ? fromBoard : input.listings).slice(0, BRIEF_ROLE_LIMIT);
  const roleBlock =
    ranked.length === 0
      ? "No roles were kept after integrity screening."
      : ranked.map(lineForListing).join("\n");

  return [
    `OpTracker just pulsed ${input.platformName}.`,
    `${input.stats.accepted} live roles are on the board (${input.stats.fetched} fetched; expired ${input.stats.expired}, mock ${input.stats.mock + input.stats.placeholder}, broken ${input.stats.broken + input.stats.invalid}, duplicate ${input.stats.duplicate}).`,
    `Daily pulse budget: ${input.budget.remaining} of ${input.budget.limit} remaining.`,
    "",
    ranked.length ? `Newest kept roles:` : roleBlock,
    ranked.length ? roleBlock : "",
    "",
    "Please:",
    "- Name the three strongest matches for me, or say none fit.",
    "- Do not apply, email anyone, or spend another pulse unless I ask.",
    "- Remind me tonight if I have not opened any of these.",
  ]
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n")
    .trim();
}

export function buildRoleBrief(listing: JobListing): string {
  const excerpt = polishExcerpt(listing.excerpt).slice(0, 420);
  return [
    "I am looking at this live OpTracker role. Research whether it is a real fit, summarize the posting, and remind me tonight if I have not decided.",
    "Do not apply or email anyone unless I say so.",
    "",
    `Title: ${listing.title}`,
    `Company: ${listing.company}`,
    `Location: ${listing.location}`,
    `Mode: ${workModeLabel(listing.workMode) ?? listing.workMode}`,
    `Board: ${listing.platformName}`,
    `Posted: ${listing.postedAt ? formatRelative(listing.postedAt) : "unknown"}`,
    `URL: ${listing.url}`,
    excerpt ? `Excerpt: ${excerpt}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildTestBrief(): string {
  return [
    "OpTracker test ping.",
    "Reply with one short confirmation that you can see this, then wait.",
    "Do not create calendar events, send email, or take any other action.",
  ].join("\n");
}
