import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChangeType } from "@/lib/git/types";

const TASK_STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-success/15 text-success border-success/20",
  PAUSED: "bg-warning/15 text-warning border-warning/20",
  COMPLETED: "bg-neutral/15 text-text-secondary border-border",
};

export function TaskStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("border font-medium", TASK_STATUS_STYLES[status] ?? "")}
    >
      {status}
    </Badge>
  );
}

const CHANGE_TYPE_STYLES: Record<ChangeType, string> = {
  modified: "bg-info/15 text-info border-info/20",
  added: "bg-success/15 text-success border-success/20",
  deleted: "bg-danger/15 text-danger border-danger/20",
  renamed: "bg-purple/15 text-purple border-purple/20",
  untracked: "bg-neutral/15 text-text-secondary border-border",
};

const CHANGE_TYPE_LABEL: Record<ChangeType, string> = {
  modified: "M",
  added: "A",
  deleted: "D",
  renamed: "R",
  untracked: "U",
};

export function ChangeTypeBadge({ changeType }: { changeType: ChangeType }) {
  return (
    <Badge
      variant="outline"
      className={cn("size-5 justify-center border p-0 font-mono text-[10px]", CHANGE_TYPE_STYLES[changeType])}
    >
      {CHANGE_TYPE_LABEL[changeType]}
    </Badge>
  );
}
