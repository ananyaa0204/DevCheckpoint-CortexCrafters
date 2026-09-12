/**
 * Thin client for Ollama's local HTTP API. No cloud fallback exists or is
 * ever called from here — see AGENT_RULES.md / the final tech stack.
 */

export type OllamaAvailability =
  | { available: true; models: string[] }
  | { available: false; error: string };

function normalizeEndpoint(endpoint: string): string {
  return endpoint.replace(/\/+$/, "");
}

function describeFetchError(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === "AbortError") return "Ollama did not respond in time.";
    if (/ECONNREFUSED|fetch failed|Failed to fetch/i.test(err.message)) {
      return "Could not connect to Ollama. Make sure it is installed and running.";
    }
    return err.message;
  }
  return "Unknown error contacting Ollama.";
}

export async function checkOllamaAvailability(
  endpoint: string,
  timeoutMs = 5000
): Promise<OllamaAvailability> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${normalizeEndpoint(endpoint)}/api/tags`, {
      signal: controller.signal,
    });
    if (!res.ok) {
      return { available: false, error: `Ollama responded with status ${res.status}.` };
    }
    const data = (await res.json()) as { models?: { name?: string; model?: string }[] };
    const models = (data.models ?? [])
      .map((m) => m.name ?? m.model ?? "")
      .filter((name): name is string => Boolean(name));
    return { available: true, models };
  } catch (err) {
    return { available: false, error: describeFetchError(err) };
  } finally {
    clearTimeout(timer);
  }
}

/** Matches "qwen2.5-coder:7b" against an exact tag or the same base name. */
export function isModelAvailable(models: string[], modelName: string): boolean {
  const base = modelName.split(":")[0];
  return models.some((m) => m === modelName || m.split(":")[0] === base);
}

export type OllamaGenerateResult = { ok: true; response: string } | { ok: false; error: string };

export async function generateWithOllama(params: {
  endpoint: string;
  model: string;
  prompt: string;
  timeoutMs?: number;
}): Promise<OllamaGenerateResult> {
  const { endpoint, model, prompt, timeoutMs = 60_000 } = params;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${normalizeEndpoint(endpoint)}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: "json",
        // Deterministic, low-temperature behavior — this is a summarizer,
        // not a creative writer.
        options: { temperature: 0 },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `Ollama returned status ${res.status}: ${body.slice(0, 200)}` };
    }
    const data = (await res.json()) as { response?: string; error?: string };
    if (data.error) return { ok: false, error: data.error };
    if (!data.response) return { ok: false, error: "Ollama returned an empty response." };
    return { ok: true, response: data.response };
  } catch (err) {
    return { ok: false, error: describeFetchError(err) };
  } finally {
    clearTimeout(timer);
  }
}
