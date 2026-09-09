import { describe, expect, it } from "vitest";
import { authorizationMatches } from "./config";
import { handleMcpMessage } from "./mcp";

describe("MCP JSON-RPC", () => {
  it("accepts Bearer tokens with extra space", () => {
    expect(authorizationMatches("Bearer secret", "secret")).toBe(true);
    expect(authorizationMatches("bearer secret", "secret")).toBe(true);
    expect(authorizationMatches("secret", "secret")).toBe(true);
    expect(authorizationMatches("Bearer other", "secret")).toBe(false);
    expect(authorizationMatches(null, "secret")).toBe(false);
  });

  it("initializes with tools capability and OpTracker instructions", async () => {
    const response = await handleMcpMessage({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "poke" } },
    });
    expect(response).toMatchObject({
      jsonrpc: "2.0",
      id: 1,
      result: {
        protocolVersion: "2025-03-26",
        serverInfo: { name: "optracker" },
      },
    });
    const result = (response as { result: { instructions: string; capabilities: { tools: object } } })
      .result;
    expect(result.instructions).toContain("Never invent listings");
    expect(result.capabilities.tools).toEqual({ listChanged: false });
  });

  it("lists the five OpTracker tools", async () => {
    const response = await handleMcpMessage({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
    });
    const tools = (response as { result: { tools: Array<{ name: string }> } }).result.tools;
    expect(tools.map((tool) => tool.name)).toEqual([
      "list_roles",
      "get_role",
      "list_boards",
      "get_budget",
      "pulse_board",
    ]);
  });

  it("ignores notifications and rejects unknown methods", async () => {
    expect(
      await handleMcpMessage({ jsonrpc: "2.0", method: "notifications/initialized" }),
    ).toBeNull();
    expect(await handleMcpMessage({ jsonrpc: "2.0", id: 9, method: "nope" })).toMatchObject({
      error: { code: -32601 },
    });
  });
});
