"use client";

import { FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChangeTypeBadge } from "@/components/shared/status-badge";
import type { ChangedFileInfo } from "@/lib/git/types";

export function ChangedFileList({
  files,
  selectedPath,
  onSelect,
}: {
  files: ChangedFileInfo[];
  selectedPath?: string | null;
  onSelect?: (path: string) => void;
}) {
  if (files.length === 0) {
    return <p className="p-4 text-sm text-text-muted">No changed files.</p>;
  }

  return (
    <div className="flex flex-col">
      {files.map((file) => {
        const isSelected = file.path === selectedPath;
        return (
          <button
            key={file.path}
            type="button"
            onClick={() => onSelect?.(file.path)}
            className={cn(
              "flex items-center gap-2 border-b border-border-subtle px-3 py-2.5 text-left text-sm transition-colors last:border-b-0",
              isSelected ? "bg-primary/10" : "hover:bg-surface-2",
              !onSelect && "cursor-default"
            )}
          >
            <FileCode2 className="size-4 shrink-0 text-text-muted" />
            <span className="min-w-0 flex-1 truncate font-mono text-[13px]">{file.path}</span>
            {file.insertions > 0 && (
              <span className="shrink-0 font-mono text-xs text-success">+{file.insertions}</span>
            )}
            {file.deletions > 0 && (
              <span className="shrink-0 font-mono text-xs text-danger">-{file.deletions}</span>
            )}
            <ChangeTypeBadge changeType={file.changeType} />
          </button>
        );
      })}
    </div>
  );
}
