import { z } from "zod";
import { jsonNoStore } from "@/lib/http/no-store";
import { queryCatalog } from "@/lib/crawl/query-catalog";
import { isMcpConfigured, isPokeConfigured } from "@/lib/poke/config";
import { notifyDeploy, notifyRole, notifyTest } from "@/lib/poke/client";
import { buildDeployBrief } from "@/lib/poke/brief";
import { readPokeStatus } from "@/lib/poke/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  intent: z.enum(["test", "role", "deploy"]),
  listingId: z.string().min(1).optional(),
});

export function GET() {
  const stored = readPokeStatus();
  return jsonNoStore({
    configured: isPokeConfigured(),
    mcp: isMcpConfigured(),
    last: stored.last,
    deployBrief: buildDeployBrief(),
  });
}

export async function POST(request: Request) {
  let parsed: z.infer<typeof bodySchema>;
  try {
    const json = await request.json();
    const result = bodySchema.safeParse(json);
    if (!result.success) {
      return jsonNoStore({ error: "Invalid Poke request." }, 400);
    }
    parsed = result.data;
  } catch {
    return jsonNoStore({ error: "Invalid Poke request." }, 400);
  }

  if (parsed.intent === "test") {
    return jsonNoStore(await notifyTest());
  }
  if (parsed.intent === "deploy") {
    return jsonNoStore(await notifyDeploy());
  }

  const listingId = parsed.listingId;
  if (!listingId) {
    return jsonNoStore({ error: "listingId is required." }, 400);
  }
  const listing = queryCatalog({}).listings.find((item) => item.id === listingId);
  if (!listing) {
    return jsonNoStore({ error: "That role is gone or filtered out." }, 404);
  }
  return jsonNoStore(await notifyRole(listing));
}
