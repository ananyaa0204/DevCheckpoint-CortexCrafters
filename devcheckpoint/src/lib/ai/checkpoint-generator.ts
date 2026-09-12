import { CheckpointAiSchema, type CheckpointAiOutput } from "@/lib/ai/checkpoint-schema";
import { buildCheckpointPrompt, type CheckpointPromptContext } from "@/lib/ai/checkpoint-prompt";
import { checkOllamaAvailability, generateWithOllama, isModelAvailable } from "@/lib/ai/ollama-client";

export type CheckpointGenerationResult =
  | { status: "COMPLETED"; data: CheckpointAiOutput }
  | { status: "FAILED"; reason: string }
  | { status: "SKIPPED"; reason: string };

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : text).trim();
}

function tryParseAndValidate(
  raw: string
): { ok: true; data: CheckpointAiOutput } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(raw));
  } catch {
    return { ok: false, error: "Response was not valid JSON." };
  }
  const result = CheckpointAiSchema.safeParse(parsed);
  if (!result.success) {
    return { ok: false, error: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  }
  return { ok: true, data: result.data };
}

/**
 * Ollama availability -> model availability -> prompt -> generate ->
 * parse -> validate -> repair-retry once -> give up. Never trusts model
 * output directly and never falls back to a cloud provider.
 */
export async function generateCheckpointSummary(input: {
  endpoint: string;
  model: string;
  context: CheckpointPromptContext;
}): Promise<CheckpointGenerationResult> {
  const availability = await checkOllamaAvailability(input.endpoint);
  if (!availability.available) {
    return {
      status: "SKIPPED",
      reason: `Ollama is not reachable at ${input.endpoint}. ${availability.error}`,
    };
  }
  if (!isModelAvailable(availability.models, input.model)) {
    return {
      status: "SKIPPED",
      reason: `Model "${input.model}" is not installed. Run: ollama pull ${input.model}`,
    };
  }

  const prompt = buildCheckpointPrompt(input.context);
  const first = await generateWithOllama({ endpoint: input.endpoint, model: input.model, prompt });
  if (!first.ok) {
    return { status: "FAILED", reason: first.error };
  }

  const firstAttempt = tryParseAndValidate(first.response);
  if (firstAttempt.ok) {
    return { status: "COMPLETED", data: firstAttempt.data };
  }

  const repairPrompt = `${prompt}\n\nYour previous response was invalid: ${firstAttempt.error}\nReturn ONLY the corrected JSON object matching the exact shape above, with no other text.`;
  const second = await generateWithOllama({
    endpoint: input.endpoint,
    model: input.model,
    prompt: repairPrompt,
  });
  if (!second.ok) {
    return { status: "FAILED", reason: second.error };
  }

  const secondAttempt = tryParseAndValidate(second.response);
  if (secondAttempt.ok) {
    return { status: "COMPLETED", data: secondAttempt.data };
  }
  return {
    status: "FAILED",
    reason: `AI output could not be validated after one retry: ${secondAttempt.error}`,
  };
}
