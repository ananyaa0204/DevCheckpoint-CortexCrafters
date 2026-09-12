"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTask } from "@/lib/actions/tasks";
import { getProjectCurrentBranch } from "@/lib/actions/git";

type ProjectOption = { id: string; name: string };

export function StartTaskForm({
  projects,
  defaultProjectId,
}: {
  projects: ProjectOption[];
  defaultProjectId?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId ?? projects[0]?.id ?? "");
  const [branch, setBranch] = useState("");
  const [notes, setNotes] = useState("");
  const [isBranchLoading, setIsBranchLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleProjectChange(value: string | null) {
    if (!value) return;
    setProjectId(value);
    setIsBranchLoading(true);
    try {
      const currentBranch = await getProjectCurrentBranch(value);
      setBranch(currentBranch ?? "");
    } finally {
      setIsBranchLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !projectId) {
      toast.error("Task title and project are required.");
      return;
    }
    startTransition(async () => {
      try {
        const task = await createTask({
          projectId,
          title: title.trim(),
          description: description.trim() || undefined,
          branch: branch.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        toast.success("Task started");
        router.push(`/tasks/${task.id}`);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not create task.");
      }
    });
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface-1 p-6 text-sm text-text-secondary">
        Add a project first before starting a task.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-1 p-5">
        <h2 className="text-sm font-semibold">Basic Information</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-title">Task Title</Label>
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Fix Stripe webhook verification"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-description">Description</Label>
          <Textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you trying to accomplish?"
            rows={4}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-1 p-5">
        <h2 className="text-sm font-semibold">Project &amp; Environment</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={handleProjectChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-branch">Branch</Label>
            <Input
              id="task-branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder={isBranchLoading ? "Detecting..." : "main"}
              disabled={isBranchLoading}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-1 p-5">
        <h2 className="text-sm font-semibold">Additional Context (optional)</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-notes">Current Status / Notes</Label>
          <Textarea
            id="task-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything worth remembering right now..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : null}
          Start Task
        </Button>
      </div>
    </form>
  );
}
