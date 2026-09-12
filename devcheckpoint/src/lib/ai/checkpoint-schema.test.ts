import { describe, expect, it } from "vitest";
import { CheckpointAiSchema } from "@/lib/ai/checkpoint-schema";

describe("CheckpointAiSchema", () => {
  it("accepts a well-formed checkpoint object", () => {
    const result = CheckpointAiSchema.safeParse({
      task: "Fix Stripe webhook verification",
      changes: ["Updated webhook handler"],
      blocker: "Signature verification is failing",
      attempts: ["Checked webhook secret"],
      importantFiles: ["src/api/webhook.ts"],
      nextStep: "Verify the raw request body reaches Stripe verification unchanged",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty strings/arrays for optional-feeling fields", () => {
    const result = CheckpointAiSchema.safeParse({
      task: "Task",
      changes: [],
      blocker: "",
      attempts: [],
      importantFiles: [],
      nextStep: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = CheckpointAiSchema.safeParse({
      task: "Task",
      changes: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong field types", () => {
    const result = CheckpointAiSchema.safeParse({
      task: "Task",
      changes: "should be an array",
      blocker: "",
      attempts: [],
      importantFiles: [],
      nextStep: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects arrays containing non-strings", () => {
    const result = CheckpointAiSchema.safeParse({
      task: "Task",
      changes: [1, 2, 3],
      blocker: "",
      attempts: [],
      importantFiles: [],
      nextStep: "",
    });
    expect(result.success).toBe(false);
  });
});
