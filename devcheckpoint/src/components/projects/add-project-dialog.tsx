"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderGit2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { checkRepositoryPath, createProject } from "@/lib/actions/projects";
import type { RepositoryValidation } from "@/lib/git/types";

export function AddProjectDialog({ trigger }: { trigger: React.ReactElement }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [validation, setValidation] = useState<RepositoryValidation | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleBrowse() {
    let pickedPath: string | null;
    try {
      const { open: openDialog } = await import("@tauri-apps/plugin-dialog");
      pickedPath = await openDialog({
        directory: true,
        multiple: false,
        title: "Select a local Git repository",
      });
    } catch {
      toast.error("Folder picker is only available in the DevCheckpoint desktop app.");
      return;
    }

    if (!pickedPath || Array.isArray(pickedPath)) return;

    setSelectedPath(pickedPath);
    setValidation(null);
    setIsChecking(true);
    try {
      const result = await checkRepositoryPath(pickedPath);
      setValidation(result);
    } catch {
      setValidation({ valid: false, reason: "Could not validate this folder." });
    } finally {
      setIsChecking(false);
    }
  }

  function handleAdd() {
    if (!selectedPath || !validation?.valid) return;
    startTransition(async () => {
      try {
        const project = await createProject(selectedPath);
        toast.success(`Added ${project.name}`);
        setOpen(false);
        setSelectedPath(null);
        setValidation(null);
        router.push(`/projects/${project.id}`);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not add project.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSelectedPath(null);
          setValidation(null);
        }
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a New Project</DialogTitle>
          <DialogDescription>
            Connect a local Git repository and start saving context.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-surface-2 p-6 text-center">
            <FolderGit2 className="size-8 text-text-muted" />
            <p className="text-sm text-text-secondary">Choose a folder on this machine.</p>
            <Button onClick={handleBrowse} disabled={isChecking}>
              {isChecking ? <Loader2 className="animate-spin" /> : null}
              Browse Folder
            </Button>
          </div>

          {selectedPath && (
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-1 p-3">
              <p className="truncate font-mono text-xs text-text-secondary">{selectedPath}</p>
              {isChecking ? (
                <p className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Loader2 className="size-3.5 animate-spin" /> Validating...
                </p>
              ) : validation?.valid ? (
                <p className="flex items-center gap-1.5 text-xs text-success">
                  <CheckCircle2 className="size-3.5" /> Valid Git repository
                </p>
              ) : validation && !validation.valid ? (
                <p className="flex items-center gap-1.5 text-xs text-danger">
                  <XCircle className="size-3.5" /> {validation.reason}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!validation?.valid || isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : null}
            Add Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
