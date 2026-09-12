"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GitStatCards } from "@/components/git/git-stat-cards";
import { FileDiffExplorer } from "@/components/git/file-diff-explorer";
import { saveCheckpoint } from "@/lib/actions/checkpoints";
import { getProjectGitContext } from "@/lib/actions/git";
import type { GitContext } from "@/lib/git/types";

export function SaveCheckpointForm({
  taskId,
  projectId,
  initialGit,
}: {
  taskId: string;
  projectId: string;
  initialGit: GitContext;
}) {
  const router = useRouter();
  const [git, setGit] = useState(initialGit);
  const [note, setNote] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const fresh = await getProjectGitContext(projectId);
      if (fresh) setGit(fresh);
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const checkpoint = await saveCheckpoint({ taskId, developerNote: note.trim() });
        if (checkpoint.generationStatus === "COMPLETED") {
          toast.success("Checkpoint saved with an AI summary");
        } else if (checkpoint.generationStatus === "SKIPPED") {
          toast.success("Checkpoint saved. AI summary was skipped — you can generate it later.");
        } else {
          toast.warning("Checkpoint saved, but the AI summary failed. You can retry it later.");
        }
        router.push(`/checkpoints/${checkpoint.id}`);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not save checkpoint.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Project Context</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      <GitStatCards
        branch={git.branch}
        filesCount={git.files.length}
        isClean={git.isClean}
        lastCommitDate={git.commits[0]?.date ?? null}
        filesTruncated={git.filesTruncated}
        totalFilesChanged={git.totalFilesChanged}
      />

      <FileDiffExplorer projectId={projectId} files={git.files} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dev-note">Add Your Notes (optional)</Label>
        <Textarea
          id="dev-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's the current blocker? What have you tried? What's next?"
          rows={5}
          maxLength={5000}
        />
        <p className="text-right text-xs text-text-muted">{note.length}/5000</p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : null}
          {isPending ? "Saving & generating summary…" : "Save Checkpoint"}
        </Button>
      </div>
    </div>
  );
}
