export {
  POKE_INBOUND_URL,
  POKE_DOCS_URL,
  POKE_INTEGRATIONS_URL,
} from "./links";
export const MCP_PROTOCOL_VERSION = "2025-03-26";
export const MCP_PROTOCOL_VERSIONS = new Set([
  "2024-11-05",
  "2025-03-26",
  "2025-06-18",
]);

export function pokeApiKey(): string | undefined {
  const key = process.env.POKE_API_KEY?.trim();
  return key || undefined;
}

export function isPokeConfigured(): boolean {
  return Boolean(pokeApiKey());
}

export function mcpAuthToken(): string | undefined {
  const dedicated = process.env.OPTRACKER_MCP_TOKEN?.trim();
  return dedicated || pokeApiKey();
}

export function isMcpConfigured(): boolean {
  return Boolean(mcpAuthToken());
}

export function authorizationMatches(header: string | null, token: string): boolean {
  if (!header) {
    return false;
  }
  const value = header.trim();
  const bearer = value.replace(/^Bearer\s+/i, "").trim();
  return bearer === token;
}
