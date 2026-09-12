import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { BackButton } from "@/components/layout/back-button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { TaskStatusControl } from "@/components/tasks/task-status-control";
import { ContextLogsPanel } from "@/components/tasks/context-logs-panel";
import { formatRelativeTime } from "@/lib/utils";
import { getTask } from "@/lib/actions/tasks";
import { listCheckpointsForTask, getLatestCheckpointForTask } from "@/lib/actions/checkpoints";
import { listCommandLogs, listErrorLogs } from "@/lib/actions/context-logs";
import type { TaskStatus } from "@/lib/actions/tasks";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const task = await getTask(taskId);
  if (!task) notFound();

  const [checkpoints, commandLogs, errorLogs, latestCheckpoint] = await Promise.all([
    listCheckpointsForTask(taskId),
    listCommandLogs(taskId),
    listErrorLogs(taskId),
    getLatestCheckpointForTask(taskId),
  ]);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <BackButton href={`/projects/${task.projectId}`} label={`Back to ${task.project.name}`} />
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: task.project.name, href: `/projects/${task.projectId}` },
              { label: task.title },
            ]}
          />
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{task.title}</h1>
            {task.branch && <p className="mt-0.5 font-mono text-xs text-text-muted">{task.branch}</p>}
          </div>
          <TaskStatusControl taskId={task.id} status={task.status as TaskStatus} />
        </div>
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

          <ContextLogsPanel taskId={task.id} initialCommands={commandLogs} initialErrors={errorLogs} />
        </div>

        <div className="flex flex-col gap-3">
          <Link href={`/checkpoints/new?taskId=${task.id}`} className={buttonVariants({ variant: "default" })}>
            Save Checkpoint
          </Link>
          <Link href={`/tasks/${task.id}/resume`} className={buttonVariants({ variant: "outline" })}>
            Resume Development
          </Link>
          <Link href={`/tasks/${task.id}/code`} className={buttonVariants({ variant: "outline" })}>
            View Code Changes
          </Link>
          {latestCheckpoint && (
            <Link
              href={`/handoffs/new?checkpointId=${latestCheckpoint.id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Create Handoff
            </Link>
          )}
          <Link href={`/projects/${task.projectId}`} className={buttonVariants({ variant: "outline" })}>
            Open Project
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
