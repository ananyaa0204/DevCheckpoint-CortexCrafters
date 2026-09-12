import type { ChangedFileInfo, CommitInfo } from "@/lib/git/types";

/**
 * A deterministic, non-AI structured summary of a checkpoint's captured
 * context. Every field here is copied directly from what was actually
 * observed (task record, Git output, the developer's own note) — nothing
 * is inferred or invented. This is intentionally NOT labeled as an AI
 * summary anywhere in the UI; Ollama/Qwen generation is a later milestone.
 */
export type ContextSnapshot = {
  schemaVersion: 1;
  generatedAt: string;
  task: {
    title: string;
    description: string | null;
  };
  branch: string | null;
  developerNote: string | null;
  changedFiles: { path: string; changeType: string }[];
  commits: { hash: string; message: string }[];
  diffTruncated: boolean;
};

export function buildContextSnapshot(input: {
  taskTitle: string;
  taskDescription: string | null;
  branch: string | null;
  developerNote: string | null;
  files: ChangedFileInfo[];
  commits: CommitInfo[];
  diffTruncated: boolean;
}): ContextSnapshot {
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    task: {
      title: input.taskTitle,
      description: input.taskDescription,
    },
    branch: input.branch,
    developerNote: input.developerNote,
    changedFiles: input.files.map((f) => ({ path: f.path, changeType: f.changeType })),
    commits: input.commits.map((c) => ({ hash: c.hash, message: c.message })),
    diffTruncated: input.diffTruncated,
  };
}
