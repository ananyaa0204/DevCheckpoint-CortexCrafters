# AI Output Schema

Checkpoint AI output should be structured and machine-validatable.

## JSON Shape

```json
{
  "task": "Fix Stripe webhook verification",
  "changes": [
    "Updated webhook handler",
    "Modified Stripe middleware"
  ],
  "blocker": "Stripe signature verification is failing",
  "attempts": [
    "Changed webhook secret",
    "Checked raw request body"
  ],
  "importantFiles": [
    "src/api/webhook.ts",
    "src/lib/stripe.ts"
  ],
  "nextStep": "Verify that the raw request body reaches Stripe verification unchanged"
}
```

## TypeScript Type

```ts
export type CheckpointSummary = {
  task: string;
  changes: string[];
  blocker: string;
  attempts: string[];
  importantFiles: string[];
  nextStep: string;
};
```

## Validation Rules

- `task` is required
- arrays must contain strings only
- `blocker` may be an empty string when no blocker exists
- `nextStep` should be concise and actionable
- important files must come from available project context
- model output must not contain secrets

## Validation Strategy

Use Zod before persistence. Invalid output should not be stored as a valid AI checkpoint summary.
