"use client";

import { useEffect, useState, useTransition } from "react";
import { ChangedFileList } from "@/components/git/changed-file-list";
import { CodeDiff } from "@/components/git/code-diff";
import { getProjectFileDiff } from "@/lib/actions/git";
import type { ChangedFileInfo } from "@/lib/git/types";

export function FileDiffExplorer({
  projectId,
  files,
}: {
  projectId: string;
  files: ChangedFileInfo[];
}) {
  const [selectedFile, setSelectedFile] = useState<string | null>(files[0]?.path ?? null);
  const [diff, setDiff] = useState("");
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    if (!selectedFile) return;
    let cancelled = false;
    startTransition(async () => {
      const d = await getProjectFileDiff(projectId, selectedFile);
      if (!cancelled) setDiff(d);
    });
    return () => {
      cancelled = true;
    };
  }, [projectId, selectedFile, startTransition]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
      <div className="overflow-hidden rounded-lg border border-border bg-surface-1">
        <div className="border-b border-border px-3 py-2.5 text-sm font-medium">
          Changed Files ({files.length})
        </div>
        <ChangedFileList files={files} selectedPath={selectedFile} onSelect={setSelectedFile} />
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-surface-1">
        <div className="border-b border-border px-3 py-2.5 font-mono text-xs text-text-secondary">
          {selectedFile ?? "Select a file"}
        </div>
        {!selectedFile ? (
          <div className="p-6 text-sm text-text-muted">No file selected.</div>
        ) : isLoading ? (
          <div className="p-6 text-sm text-text-muted">Loading diff…</div>
        ) : (
          <CodeDiff diff={diff} />
        )}
      </div>
    </div>
  );
}
