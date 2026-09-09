import { jsonNoStore } from "@/lib/http/no-store";
import {
  authorizationMatches,
  isMcpConfigured,
  mcpAuthToken,
} from "@/lib/poke/config";
import { handleMcpPayload } from "@/lib/poke/mcp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Authorization, Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id, X-Poke-User-Id",
  "Access-Control-Expose-Headers": "MCP-Protocol-Version, Mcp-Session-Id",
  "Cache-Control": "no-store, max-age=0",
};

function unauthorized() {
  return jsonNoStore({ error: "Unauthorized." }, 401);
}

function requireAuth(request: Request): boolean {
  const token = mcpAuthToken();
  if (!token) {
    return false;
  }
  return authorizationMatches(request.headers.get("authorization"), token);
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export function GET(request: Request) {
  if (!isMcpConfigured()) {
    return jsonNoStore(
      { error: "Set OPTRACKER_MCP_TOKEN or POKE_API_KEY to enable the MCP endpoint." },
      503,
    );
  }
  if (!requireAuth(request)) {
    return unauthorized();
  }
  return new Response(null, { status: 405, headers: CORS });
}

export function DELETE(request: Request) {
  if (!isMcpConfigured() || !requireAuth(request)) {
    return unauthorized();
  }
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request: Request) {
  if (!isMcpConfigured()) {
    return jsonNoStore(
      { error: "Set OPTRACKER_MCP_TOKEN or POKE_API_KEY to enable the MCP endpoint." },
      503,
    );
  }
  if (!requireAuth(request)) {
    return unauthorized();
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonNoStore({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, 400);
  }

  const result = await handleMcpPayload(payload);
  const accept = request.headers.get("accept") ?? "";
  const asSse = accept.includes("text/event-stream") && !accept.includes("application/json");

  if (result === null) {
    return new Response(null, { status: 202, headers: CORS });
  }

  if (asSse) {
    const frames = (Array.isArray(result) ? result : [result])
      .map((item) => `event: message\ndata: ${JSON.stringify(item)}\n\n`)
      .join("");
    return new Response(frames, {
      status: 200,
      headers: {
        ...CORS,
        "Content-Type": "text/event-stream",
        "MCP-Protocol-Version": "2025-03-26",
      },
    });
  }

  return Response.json(result, {
    status: 200,
    headers: {
      ...CORS,
      "MCP-Protocol-Version": "2025-03-26",
    },
  });
}
