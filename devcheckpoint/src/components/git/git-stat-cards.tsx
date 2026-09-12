import { GitBranch, FileCode2, Circle, Clock } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export function GitStatCards({
  branch,
  filesCount,
  isClean,
  lastCommitDate,
}: {
  branch: string | null;
  filesCount: number;
  isClean: boolean;
  lastCommitDate: string | null;
}) {
  const items = [
    {
      icon: GitBranch,
      value: branch ?? "unknown",
      label: "Current Branch",
      mono: true,
    },
    {
      icon: FileCode2,
      value: String(filesCount),
      label: filesCount === 1 ? "Modified File" : "Modified Files",
    },
    {
      icon: Circle,
      value: isClean ? "No" : "Yes",
      label: "Uncommitted Changes",
    },
    {
      icon: Clock,
      value: lastCommitDate ? formatRelativeTime(lastCommitDate) : "—",
      label: "Last Commit",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 rounded-lg border border-border bg-surface-1 p-4"
        >
          <item.icon className="size-4 shrink-0 text-text-muted" />
          <div className="flex min-w-0 flex-col">
            <span className={item.mono ? "truncate font-mono text-sm text-foreground" : "text-sm text-foreground"}>
              {item.value}
            </span>
            <span className="text-xs text-text-muted">{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
