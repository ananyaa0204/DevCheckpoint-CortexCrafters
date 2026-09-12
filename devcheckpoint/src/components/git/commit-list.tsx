import { GitCommit } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { CommitInfo } from "@/lib/git/types";

export function CommitList({ commits }: { commits: CommitInfo[] }) {
  if (commits.length === 0) {
    return <p className="p-4 text-sm text-text-muted">No commits yet.</p>;
  }

  return (
    <div className="flex flex-col">
      {commits.map((commit) => (
        <div
          key={commit.hash}
          className="flex items-center gap-3 border-b border-border-subtle px-1 py-2.5 last:border-b-0"
        >
          <GitCommit className="size-4 shrink-0 text-text-muted" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-foreground">{commit.message}</p>
            <p className="text-xs text-text-muted">
              {formatRelativeTime(commit.date)} · by {commit.authorName}
            </p>
          </div>
          <span className="shrink-0 font-mono text-xs text-text-muted">{commit.hash}</span>
        </div>
      ))}
    </div>
  );
}
