import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { TaskStatusControl } from "@/components/tasks/task-status-control";
import { formatRelativeTime } from "@/lib/utils";
import { getTask } from "@/lib/actions/tasks";
import { listCheckpointsForTask } from "@/lib/actions/checkpoints";
import type { TaskStatus } from "@/lib/actions/tasks";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const task = await getTask(taskId);
  if (!task) notFound();

  const checkpoints = await listCheckpointsForTask(taskId);

  return (
    <AppShell>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs text-text-muted">
            <Link href="/tasks" className="hover:underline">
              Tasks
            </Link>{" "}
            / {task.project.name}
          </p>
          <h1 className="text-xl font-semibold text-foreground">{task.title}</h1>
          {task.branch && <p className="mt-0.5 font-mono text-xs text-text-muted">{task.branch}</p>}
        </div>
        <TaskStatusControl taskId={task.id} status={task.status as TaskStatus} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          {task.description && (
            <div className="rounded-lg border border-border bg-surface-1 p-4">
              <h2 className="mb-2 text-sm font-semibold">Description</h2>
              <p className="text-sm text-text-secondary">{task.description}</p>
            </div>
          )}

          {task.notes && (
            <div className="rounded-lg border border-border bg-surface-1 p-4">
              <h2 className="mb-2 text-sm font-semibold">Notes</h2>
              <p className="text-sm text-text-secondary">{task.notes}</p>
            </div>
          )}

          <div className="rounded-lg border border-border bg-surface-1 p-4">
            <h2 className="mb-3 text-sm font-semibold">Checkpoints ({checkpoints.length})</h2>
            {checkpoints.length === 0 ? (
              <EmptyState
                title="No checkpoints yet"
                description="Save your current development state so you can resume it later."
              />
            ) : (
              <div className="flex flex-col">
                {checkpoints.map((c) => (
                  <Link
                    key={c.id}
                    href={`/checkpoints/${c.id}`}
                    className="flex items-center justify-between border-b border-border-subtle py-2.5 last:border-b-0 hover:opacity-80"
                  >
                    <span className="text-sm text-foreground">{c.files.length} files changed</span>
                    <span className="text-xs text-text-muted">{formatRelativeTime(c.createdAt)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button render={<Link href={`/checkpoints/new?taskId=${task.id}`} />}>Save Checkpoint</Button>
          <Button variant="outline" render={<Link href={`/tasks/${task.id}/code`} />}>
            View Code Changes
          </Button>
          <Button variant="outline" render={<Link href={`/tasks/${task.id}/resume`} />}>
            Resume Development
          </Button>
          <Button variant="outline" render={<Link href={`/projects/${task.projectId}`} />}>
            Open Project
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
