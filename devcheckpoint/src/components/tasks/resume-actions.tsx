"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { touchProjectOpened } from "@/lib/actions/projects";

export function ResumeActions({ taskId, projectId }: { taskId: string; projectId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleResume() {
    startTransition(async () => {
      try {
        await updateTaskStatus(taskId, "ACTIVE");
        await touchProjectOpened(projectId);
        toast.success("Task resumed");
        router.push(`/projects/${projectId}`);
        router.refresh();
      } catch {
        toast.error("Could not resume task.");
      }
    });
  }

  return (
    <Button onClick={handleResume} disabled={isPending}>
      {isPending ? <Loader2 className="animate-spin" /> : <Play />}
      Resume Development
    </Button>
  );
}
