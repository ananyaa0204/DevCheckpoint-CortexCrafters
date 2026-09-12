export type CheckpointPromptContext = {
  taskTitle: string;
  taskDescription: string | null;
  branch: string | null;
  files: { path: string; changeType: string }[];
  diff: string;
  commits: { hash: string; message: string }[];
  developerNote: string | null;
};

/**
 * Builds the prompt sent to Qwen. The context passed in here must already
 * be sanitized (src/lib/security/sanitizer.ts) — this module never sees or
 * forwards raw, unredacted content.
 */
export function buildCheckpointPrompt(input: CheckpointPromptContext): string {
  const filesList = input.files.length
    ? input.files.map((f) => `- ${f.path} (${f.changeType})`).join("\n")
    : "(no changed files)";

  const commitsList = input.commits.length
    ? input.commits.map((c) => `- ${c.hash} ${c.message}`).join("\n")
    : "(no recent commits)";

  return `You are DevCheckpoint's local context summarizer. You are not a coding assistant, you do not write or suggest code, and you never execute anything.

Given the development context below, return a single JSON object with EXACTLY this shape and nothing else:

{
  "task": string,
  "changes": string[],
  "blocker": string,
  "attempts": string[],
  "importantFiles": string[],
  "nextStep": string
}

Rules:
- Return JSON only. Do not use Markdown, code fences, or any explanatory text before or after the JSON.
- Infer only from the context supplied below. Do not invent files, commands, errors, or attempts that are not present in it.
- "importantFiles" must only contain paths that appear in the Changed Files list below.
- If no blocker is evident, use an empty string for "blocker". Do not fabricate one.
- Keep "nextStep" concise and actionable (one or two sentences).
- Never output secrets, credentials, tokens, or API keys, even if one appears in the context.

Task: ${input.taskTitle}
Task description: ${input.taskDescription ?? "(none provided)"}
Branch: ${input.branch ?? "(unknown)"}

Changed files:
${filesList}

Recent commits:
${commitsList}

Developer note:
${input.developerNote ?? "(none provided)"}

Diff (may be truncated):
${input.diff || "(no diff captured)"}
`;
}
