import { POKE_INBOUND_URL, isPokeConfigured, pokeApiKey } from "./config";
import { buildPulseBrief, buildRoleBrief, buildTestBrief } from "./brief";
import { recordPokeSend, type PokeBriefKind } from "./status";
import type { CrawlBudget, IntegrityStats, JobListing } from "@/lib/domain/types";

export interface PokeSendResult {
  configured: boolean;
  sent: boolean;
  kind?: PokeBriefKind;
  summary?: string;
  error?: string;
}

const TIMEOUT_MS = 6_000;

export async function sendPokeMessage(
  message: string,
  kind: PokeBriefKind,
  summary: string,
): Promise<PokeSendResult> {
  if (!isPokeConfigured()) {
    return { configured: false, sent: false, kind, summary };
  }

  const key = pokeApiKey();
  if (!key) {
    return { configured: false, sent: false, kind, summary };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(POKE_INBOUND_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ message }),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = `Poke responded ${response.status}`;
      recordPokeSend({ at: new Date().toISOString(), ok: false, kind, summary, error });
      return { configured: true, sent: false, kind, summary, error };
    }

    recordPokeSend({ at: new Date().toISOString(), ok: true, kind, summary });
    return { configured: true, sent: true, kind, summary };
  } catch (error) {
    const messageText =
      error instanceof Error && error.name === "AbortError"
        ? "Poke timed out"
        : error instanceof Error
          ? error.message
          : "Poke request failed";
    recordPokeSend({
      at: new Date().toISOString(),
      ok: false,
      kind,
      summary,
      error: messageText,
    });
    return { configured: true, sent: false, kind, summary, error: messageText };
  } finally {
    clearTimeout(timer);
  }
}

export async function notifyPulse(input: {
  platformName: string;
  stats: IntegrityStats;
  budget: Pick<CrawlBudget, "remaining" | "limit">;
  listings: JobListing[];
}): Promise<PokeSendResult> {
  if (!isPokeConfigured()) {
    return { configured: false, sent: false };
  }
  if (input.stats.accepted < 1) {
    return { configured: true, sent: false, summary: "No roles to brief" };
  }
  const message = buildPulseBrief(input);
  return sendPokeMessage(
    message,
    "pulse",
    `${input.stats.accepted} ${input.platformName} roles`,
  );
}

export async function notifyRole(listing: JobListing): Promise<PokeSendResult> {
  if (!isPokeConfigured()) {
    return { configured: false, sent: false };
  }
  return sendPokeMessage(
    buildRoleBrief(listing),
    "role",
    `${listing.title} at ${listing.company}`,
  );
}

export async function notifyTest(): Promise<PokeSendResult> {
  if (!isPokeConfigured()) {
    return { configured: false, sent: false, error: "POKE_API_KEY is not set." };
  }
  return sendPokeMessage(buildTestBrief(), "test", "Test ping");
}
