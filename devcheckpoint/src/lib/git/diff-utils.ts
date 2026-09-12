export type DiffLine = {
  type: "add" | "remove" | "context" | "hunk" | "meta";
  content: string;
};

/** Parses a unified diff into renderable lines. Display-only, no Git writes. */
export function parseUnifiedDiff(diff: string): DiffLine[] {
  if (!diff.trim()) return [];

  return diff.split("\n").map((line): DiffLine => {
    if (line.startsWith("@@")) return { type: "hunk", content: line };
    if (
      line.startsWith("diff --git") ||
      line.startsWith("index ") ||
      line.startsWith("---") ||
      line.startsWith("+++")
    ) {
      return { type: "meta", content: line };
    }
    if (line.startsWith("+")) return { type: "add", content: line.slice(1) };
    if (line.startsWith("-")) return { type: "remove", content: line.slice(1) };
    return { type: "context", content: line.startsWith(" ") ? line.slice(1) : line };
  });
}
