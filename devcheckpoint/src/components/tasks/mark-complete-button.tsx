"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateTaskStatus } from "@/lib/actions/tasks";

export function MarkCompleteButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await updateTaskStatus(taskId, "COMPLETED");
        toast.success("Task marked complete");
        router.refresh();
      } catch {
        toast.error("Could not update task status.");
      }
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending} className="w-full">
      {isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
      Mark Task Complete
    </Button>
  );
}
