import { z } from "zod";

/**
 * Exact structure Qwen must return. Nothing is trusted until it passes
 * this schema — see docs/AI_OUTPUT_SCHEMA.md / ARCHITECTURE.md §6.
 */
export const CheckpointAiSchema = z.object({
  task: z.string(),
  changes: z.array(z.string()),
  blocker: z.string(),
  attempts: z.array(z.string()),
  importantFiles: z.array(z.string()),
  nextStep: z.string(),
});

export type CheckpointAiOutput = z.infer<typeof CheckpointAiSchema>;
