import { afterEach, describe, expect, it, vi } from "vitest";
import { generateCheckpointSummary } from "@/lib/ai/checkpoint-generator";

const ENDPOINT = "http://localhost:11434";
const MODEL = "qwen2.5-coder:7b";

const CONTEXT = {
  taskTitle: "Fix Stripe webhook verification",
  taskDescription: null,
  branch: "feature/stripe-webhook",
  files: [{ path: "src/api/webhook.ts", changeType: "modified" }],
  diff: "+ verify signature",
  commits: [{ hash: "abc1234", message: "add webhook endpoint" }],
  developerNote: "Signature check keeps failing.",
};

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("generateCheckpointSummary", () => {
  it("returns SKIPPED when Ollama is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fetch failed")));

    const result = await generateCheckpointSummary({ endpoint: ENDPOINT, model: MODEL, context: CONTEXT });
    expect(result.status).toBe("SKIPPED");
  });

  it("returns SKIPPED when the configured model is not installed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ models: [{ name: "llama3:8b" }] }))
    );

    const result = await generateCheckpointSummary({ endpoint: ENDPOINT, model: MODEL, context: CONTEXT });
    expect(result.status).toBe("SKIPPED");
    if (result.status === "SKIPPED") {
      expect(result.reason).toContain(MODEL);
    }
  });

  it("returns COMPLETED with validated data on a clean first response", async () => {
    const valid = {
      task: "Fix Stripe webhook verification",
      changes: ["Updated webhook handler"],
      blocker: "Signature verification is failing",
      attempts: ["Checked webhook secret"],
      importantFiles: ["src/api/webhook.ts"],
      nextStep: "Verify the raw request body is unmodified before verification",
    };

    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.endsWith("/api/tags")) return jsonResponse({ models: [{ name: MODEL }] });
      return jsonResponse({ response: JSON.stringify(valid), done: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateCheckpointSummary({ endpoint: ENDPOINT, model: MODEL, context: CONTEXT });
    expect(result.status).toBe("COMPLETED");
    if (result.status === "COMPLETED") {
      expect(result.data.task).toBe(valid.task);
    }
  });

  it("repairs a malformed first response and succeeds on retry", async () => {
    const valid = {
      task: "Fix Stripe webhook verification",
      changes: [],
      blocker: "",
      attempts: [],
      importantFiles: [],
      nextStep: "Investigate further",
    };

    let generateCalls = 0;
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.endsWith("/api/tags")) return jsonResponse({ models: [{ name: MODEL }] });
      generateCalls++;
      if (generateCalls === 1) {
        return jsonResponse({ response: "not json at all", done: true });
      }
      return jsonResponse({ response: JSON.stringify(valid), done: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateCheckpointSummary({ endpoint: ENDPOINT, model: MODEL, context: CONTEXT });
    expect(generateCalls).toBe(2);
    expect(result.status).toBe("COMPLETED");
  });

  it("returns FAILED when both attempts are malformed", async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.endsWith("/api/tags")) return jsonResponse({ models: [{ name: MODEL }] });
      return jsonResponse({ response: "still not json", done: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateCheckpointSummary({ endpoint: ENDPOINT, model: MODEL, context: CONTEXT });
    expect(result.status).toBe("FAILED");
  });

  it("returns FAILED when the model returns schema-invalid JSON", async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.endsWith("/api/tags")) return jsonResponse({ models: [{ name: MODEL }] });
      return jsonResponse({ response: JSON.stringify({ task: "x", changes: "not-an-array" }), done: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateCheckpointSummary({ endpoint: ENDPOINT, model: MODEL, context: CONTEXT });
    expect(result.status).toBe("FAILED");
  });
});
