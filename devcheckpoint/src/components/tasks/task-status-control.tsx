"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateTaskStatus, type TaskStatus } from "@/lib/actions/tasks";

const STATUSES: TaskStatus[] = ["ACTIVE", "PAUSED", "COMPLETED"];

export function TaskStatusControl({ taskId, status }: { taskId: string; status: TaskStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string | null) {
    if (!next) return;
    startTransition(async () => {
      try {
        await updateTaskStatus(taskId, next as TaskStatus);
        toast.success(`Task marked ${next.toLowerCase()}`);
        router.refresh();
      } catch {
        toast.error("Could not update task status.");
      }
    });
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
