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
        toast.success("Checkpoint saved");
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
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : null}
          Save Checkpoint
        </Button>
      </div>
    </div>
  );
}
