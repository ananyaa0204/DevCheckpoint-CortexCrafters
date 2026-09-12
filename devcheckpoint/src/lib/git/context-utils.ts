import type { ChangedFileInfo, ChangeType } from "./types";

/** Maps simple-git's raw status letters to our ChangeType union. */
export function mapChangeType(index: string, workingDir: string): ChangeType {
  const code = index !== " " && index !== "?" ? index : workingDir;
  switch (code) {
    case "A":
      return "added";
    case "D":
      return "deleted";
    case "R":
      return "renamed";
    case "?":
      return "untracked";
    case "M":
    default:
      return "modified";
  }
}

/**
 * Keeps at most `maxFiles` changed files, staged files first (they're the
 * most likely to matter for the next commit), so a repository with a huge
 * changeset never makes the UI or an AI payload unbounded.
 */
export function prioritizeAndTruncateFiles(
  files: ChangedFileInfo[],
  maxFiles: number
): { files: ChangedFileInfo[]; truncated: boolean; total: number } {
  const prioritized = [...files].sort((a, b) => Number(b.staged) - Number(a.staged));
  const truncated = prioritized.length > maxFiles;
  return {
    files: truncated ? prioritized.slice(0, maxFiles) : prioritized,
    truncated,
    total: prioritized.length,
  };
}

export function truncateDiff(diff: string, maxChars: number): { diff: string; truncated: boolean } {
  const truncated = diff.length > maxChars;
  return { diff: truncated ? diff.slice(0, maxChars) : diff, truncated };
}
