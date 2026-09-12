"use server";

import { checkOllamaAvailability, isModelAvailable } from "@/lib/ai/ollama-client";

export type OllamaConnectionStatus =
  | { connected: true; modelAvailable: boolean; models: string[] }
  | { connected: false; error: string };

export async function testOllamaConnection(
  endpoint: string,
  model: string
): Promise<OllamaConnectionStatus> {
  const availability = await checkOllamaAvailability(endpoint);
  if (!availability.available) {
    return { connected: false, error: availability.error };
  }
  return {
    connected: true,
    modelAvailable: isModelAvailable(availability.models, model),
    models: availability.models,
  };
}
