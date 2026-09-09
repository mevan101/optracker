import { crawlPlatform } from "@/lib/crawl/orchestrator";
import { queryCatalog } from "@/lib/crawl/query-catalog";
import { toPlatformRows } from "@/lib/crawl/present-platforms";
import { getPlatform, isCrawlablePlatform } from "@/lib/domain/platforms";
import { MCP_PROTOCOL_VERSION, MCP_PROTOCOL_VERSIONS } from "./config";

type JsonRpcId = string | number | null;

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: unknown;
}

interface JsonRpcError {
  jsonrpc: "2.0";
  id: JsonRpcId;
  error: { code: number; message: string };
}

interface JsonRpcSuccess {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result: unknown;
}

export type JsonRpcResponse = JsonRpcError | JsonRpcSuccess;

const TOOLS = [
  {
    name: "list_roles",
    description:
      "List live OpTracker roles that already passed integrity screening. Use for search, board, or work-mode questions.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        q: { type: "string", description: "Title, company, location, or tag search." },
        platform: {
          type: "string",
          description: "Board id such as remotive, remoteok, arbeitnow, or jobicy.",
        },
        workMode: {
          type: "string",
          enum: ["remote", "hybrid", "onsite", "unknown"],
        },
        limit: { type: "integer", minimum: 1, maximum: 25, default: 12 },
      },
    },
  },
  {
    name: "get_role",
    description: "Get one live role by OpTracker id.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["id"],
      properties: {
        id: { type: "string" },
      },
    },
  },
  {
    name: "list_boards",
    description:
      "List curated boards. JSON feeds show live counts; directory boards are outbound links only.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {},
    },
  },
  {
    name: "get_budget",
    description: "Return remaining OpTracker pulses for the current UTC day (max 5).",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {},
    },
  },
  {
    name: "pulse_board",
    description:
      "Fetch one public JSON feed and refresh the live board. Consumes one of today's five pulses. Only call when the user explicitly asks to pulse, fetch, or refresh a board.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["platformId"],
      properties: {
        platformId: {
          type: "string",
          description: "Crawlable board id: remoteok, remotive, arbeitnow, or jobicy.",
        },
      },
    },
  },
] as const;

function compactListing(listing: {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: string;
  platformId: string;
  platformName: string;
  url: string;
  postedAt: string | null;
  salary: string | null;
  excerpt: string;
}) {
  return {
    id: listing.id,
    title: listing.title,
    company: listing.company,
    location: listing.location,
    workMode: listing.workMode,
    platformId: listing.platformId,
    platformName: listing.platformName,
    url: listing.url,
    postedAt: listing.postedAt,
    salary: listing.salary,
    excerpt: listing.excerpt.slice(0, 280),
  };
}

function textResult(text: string, structured?: unknown) {
  return {
    content: [{ type: "text", text }],
    structuredContent: structured,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asLimit(value: unknown, fallback = 12): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(25, Math.max(1, Math.floor(n)));
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "list_roles": {
      const result = queryCatalog({
        q: asString(args.q),
        platform: asString(args.platform),
        workMode: asString(args.workMode),
        limit: asLimit(args.limit),
      });
      return textResult(
        result.listings.length
          ? result.listings
              .map(
                (listing) =>
                  `${listing.title} at ${listing.company} (${listing.platformName}) ${listing.url}`,
              )
              .join("\n")
          : "No live roles matched.",
        {
          total: result.total,
          returned: result.listings.length,
          listings: result.listings.map(compactListing),
        },
      );
    }
    case "get_role": {
      const id = asString(args.id);
      if (!id) {
        throw new Error("id is required.");
      }
      const listing = queryCatalog({}).listings.find((item) => item.id === id);
      if (!listing) {
        return textResult("That role is gone, expired, or filtered out.");
      }
      return textResult(
        `${listing.title} at ${listing.company}\n${listing.url}`,
        compactListing(listing),
      );
    }
    case "list_boards": {
      const catalog = queryCatalog({});
      const platforms = toPlatformRows(catalog.listings, catalog.lastAttempts);
      return textResult(
        platforms
          .map((platform) =>
            platform.crawlable
              ? `${platform.name} (${platform.id}): JSON feed, ${platform.liveCount} live`
              : `${platform.name} (${platform.id}): directory link only`,
          )
          .join("\n"),
        { platforms },
      );
    }
    case "get_budget": {
      const budget = queryCatalog({}).budget;
      return textResult(
        `${budget.remaining} of ${budget.limit} pulses remaining on ${budget.date} UTC.`,
        budget,
      );
    }
    case "pulse_board": {
      const platformId = asString(args.platformId);
      if (!platformId) {
        throw new Error("platformId is required.");
      }
      if (!isCrawlablePlatform(platformId)) {
        throw new Error("That board is a directory destination and is not pulsed.");
      }
      const result = await crawlPlatform({ platformId });
      const name = getPlatform(platformId)?.name ?? platformId;
      return textResult(
        result.attempt.ok
          ? `Pulsed ${name}. ${result.attempt.stats.accepted} roles kept. ${result.budget.remaining} pulses left today.`
          : `Pulse failed for ${name}: ${result.attempt.error ?? "no usable payload"}.`,
        {
          attempt: result.attempt,
          budget: result.budget,
          listingCount: result.listings.length,
        },
      );
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function errorResponse(id: JsonRpcId, code: number, message: string): JsonRpcError {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function success(id: JsonRpcId, result: unknown): JsonRpcSuccess {
  return { jsonrpc: "2.0", id, result };
}

export function isJsonRpcNotification(message: JsonRpcRequest): boolean {
  return message.id === undefined && typeof message.method === "string";
}

export async function handleMcpMessage(message: unknown): Promise<JsonRpcResponse | null> {
  if (!message || typeof message !== "object") {
    return errorResponse(null, -32600, "Invalid request");
  }
  const request = message as JsonRpcRequest;
  if (request.jsonrpc !== "2.0" || typeof request.method !== "string") {
    return errorResponse(request.id ?? null, -32600, "Invalid request");
  }
  if (isJsonRpcNotification(request)) {
    return null;
  }
  const id = request.id ?? null;

  switch (request.method) {
    case "initialize": {
      const params = asRecord(request.params);
      const requested = asString(params.protocolVersion);
      const protocolVersion =
        requested && MCP_PROTOCOL_VERSIONS.has(requested) ? requested : MCP_PROTOCOL_VERSION;
      return success(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "optracker", version: "1.0.0" },
        instructions:
          "OpTracker is a live job board. Roles come from public JSON feeds (Remote OK, Remotive, Arbeitnow, Jobicy) after integrity screening. Directory boards are links only. There are 5 pulses per UTC day. Never invent listings.",
      });
    }
    case "ping":
      return success(id, {});
    case "tools/list":
      return success(id, { tools: TOOLS });
    case "tools/call": {
      const params = asRecord(request.params);
      const name = asString(params.name);
      if (!name) {
        return errorResponse(id, -32602, "Tool name is required.");
      }
      try {
        const result = await callTool(name, asRecord(params.arguments));
        return success(id, result);
      } catch (error) {
        const text = error instanceof Error ? error.message : "Tool failed.";
        return success(id, {
          content: [{ type: "text", text }],
          isError: true,
        });
      }
    }
    default:
      return errorResponse(id, -32601, `Method not found: ${request.method}`);
  }
}

export async function handleMcpPayload(payload: unknown): Promise<JsonRpcResponse | JsonRpcResponse[] | null> {
  if (Array.isArray(payload)) {
    const responses: JsonRpcResponse[] = [];
    for (const item of payload) {
      const response = await handleMcpMessage(item);
      if (response) {
        responses.push(response);
      }
    }
    return responses.length ? responses : null;
  }
  return handleMcpMessage(payload);
}

export { TOOLS as MCP_TOOLS };
