import { describe, it, expect } from "vitest";
import {
  resolveToolDefinition,
  buildAuthHeaders,
  buildHttpRequest,
  runToolsForAgent,
} from "../toolsRuntime.mts";
import type {
  ToolDefinition,
  ToolRegistry,
} from "../../../core/types";

describe("toolsRuntime", () => {
  it("resolveToolDefinition returns tool from registry or null", () => {
    const registry: ToolRegistry = {
      web_search: { type: "http", endpoint: "https://api.example.com" },
    };

    const found = resolveToolDefinition("web_search", registry);
    expect(found).toEqual(registry.web_search);

    const missing = resolveToolDefinition("unknown_tool", registry);
    expect(missing).toBeNull();
  });

  it("buildAuthHeaders supports api_key with explicit header", () => {
    const headers = buildAuthHeaders(
      {
        type: "api_key",
        key: "SECRET-123",
        header_key: "X-API-Key",
      },
      undefined
    );

    expect(headers).toEqual({
      "X-API-Key": "SECRET-123",
    });
  });

  it("buildAuthHeaders falls back to globalApiKey for api_key tools", () => {
    const headers = buildAuthHeaders(
      {
        type: "api_key",
        header_key: "X-API-Key",
      },
      "GLOBAL-KEY"
    );

    expect(headers).toEqual({
      "X-API-Key": "GLOBAL-KEY",
    });
  });

  it("buildAuthHeaders builds bearer Authorization header", () => {
    const h1 = buildAuthHeaders(
      {
        type: "bearer",
        token: "abc123",
      },
      undefined
    );

    expect(h1).toEqual({
      Authorization: "Bearer abc123",
    });

    const h2 = buildAuthHeaders(
      {
        type: "bearer",
        token: "Bearer xyz",
      },
      undefined
    );

    expect(h2).toEqual({
      Authorization: "Bearer xyz",
    });
  });

  it("buildAuthHeaders supports oauth2 with ready token", () => {
    const headers = buildAuthHeaders(
      {
        type: "oauth2",
        token: "Bearer oauth_token",
      },
      undefined
    );

    expect(headers).toEqual({
      Authorization: "Bearer oauth_token",
    });
  });

  it("buildHttpRequest builds GET url with query params", () => {
    const def: ToolDefinition = {
      type: "http",
      endpoint: "https://api.example.com/search",
      method: "GET",
    };

    const { url, init } = buildHttpRequest(def, {
      input: {
        q: "wifi",
        limit: 10,
      },
    });

    // Volgorde van query params is deterministisch vanwege URLSearchParams
    expect(url).toBe("https://api.example.com/search?q=wifi&limit=10");
    expect(init.method).toBe("GET");
    expect(init.body).toBeUndefined();
  });

  it("buildHttpRequest builds POST with JSON body and auth header", () => {
    const def: ToolDefinition = {
      type: "http",
      endpoint: "https://api.example.com",
      method: "POST",
      auth: {
        type: "api_key",
        header_key: "X-API-Key",
      },
    };

    const { url, init } = buildHttpRequest(def, {
      operation: "classify",
      input: { text: "My wifi is broken" },
      globalApiKey: "SECRET",
    });

    expect(url).toBe("https://api.example.com/classify");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.headers["X-API-Key"]).toBe("SECRET");
    expect(init.body).toBe(JSON.stringify({ text: "My wifi is broken" }));
  });

  it("buildHttpRequest throws for non-http tools", () => {
    const def: ToolDefinition = {
      type: "builtin",
    } as any;

    expect(() => buildHttpRequest(def, {})).toThrowError(
      /only supports HTTP tools/i
    );
  });

  it("runToolsForAgent returns same context and empty results when no tools", async () => {
    const context = { foo: "bar" };

    const result = await runToolsForAgent({
      agentId: "agent1",
      agentTools: [],
      registry: {},
      context,
      parsedOutput: { x: 1 },
    });

    expect(result.updatedContext).toEqual(context);
    expect(result.toolResults).toEqual({});
  });

  it("runToolsForAgent writes error for missing tools into context.__tools", async () => {
    const context: Record<string, any> = {};

    const result = await runToolsForAgent({
      agentId: "agent1",
      agentTools: ["unknown_tool"],
      registry: {},
      context,
      parsedOutput: {},
    });

    expect(result.toolResults["unknown_tool"].ok).toBe(false);
    expect(result.toolResults["unknown_tool"].error).toMatch(/not found/i);

    expect(result.updatedContext.__tools).toBeDefined();
    expect(result.updatedContext.__tools.agent1).toBeDefined();
    expect(result.updatedContext.__tools.agent1.unknown_tool).toEqual(
      result.toolResults["unknown_tool"]
    );
  });

  it("runToolsForAgent returns error for unsupported tool types", async () => {
    const registry: ToolRegistry = {
      builtin_tool: { type: "builtin" } as any,
    };

    const context: Record<string, any> = {};

    const result = await runToolsForAgent({
      agentId: "agent1",
      agentTools: ["builtin_tool"],
      registry,
      context,
      parsedOutput: {},
    });

    const res = result.toolResults["builtin_tool"];

    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/not implemented/i);

    expect(result.updatedContext.__tools.agent1.builtin_tool).toEqual(res);
  });
});
