import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ChangeTypeBadge } from "@/components/shared/status-badge";
import { CommitList } from "@/components/git/commit-list";
import { ResumeActions } from "@/components/tasks/resume-actions";
import { formatRelativeTime } from "@/lib/utils";
import { getTask } from "@/lib/actions/tasks";
import { getLatestCheckpointForTask } from "@/lib/actions/checkpoints";
import type { ChangeType, CommitInfo } from "@/lib/git/types";

export default async function ResumeTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const task = await getTask(taskId);
  if (!task) notFound();

  const checkpoint = await getLatestCheckpointForTask(taskId);
  const commits: CommitInfo[] = checkpoint?.commitsJson ? JSON.parse(checkpoint.commitsJson) : [];

  return (
    <AppShell>
      <p className="mb-1 text-xs text-text-muted">
        <Link href="/tasks" className="hover:underline">
          Tasks
        </Link>
      </p>
      <h1 className="mb-1 text-2xl font-bold text-foreground">Resume Development</h1>
      <p className="mb-6 text-sm text-text-secondary">Pick up right where you left off.</p>

      <div className="mb-5 flex items-center justify-between rounded-lg border border-border bg-surface-1 p-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">{task.title}</h2>
          <p className="text-xs text-text-muted">
            {task.project.name}
            {task.branch ? ` · ${task.branch}` : ""}
          </p>
        </div>
        <ResumeActions taskId={task.id} projectId={task.projectId} />
      </div>

      {!checkpoint ? (
        <EmptyState
          title="No saved checkpoint yet"
          description="Save a checkpoint from this task to be able to resume it later."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-surface-1 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Last Saved Checkpoint</h3>
                <span className="text-xs text-text-muted">{formatRelativeTime(checkpoint.createdAt)}</span>
              </div>
              <p className="text-sm text-text-secondary">
                Branch <span className="font-mono text-foreground">{checkpoint.branch ?? "—"}</span> ·{" "}
                {checkpoint.files.length} files changed
              </p>
            </div>

            {checkpoint.developerNote && (
              <div className="rounded-lg border border-border bg-surface-1 p-4">
                <h3 className="mb-2 text-sm font-semibold">What you were doing</h3>
                <p className="text-sm text-text-secondary">{checkpoint.developerNote}</p>
              </div>
            )}

            <div className="rounded-lg border border-border bg-surface-1 p-4">
              <h3 className="mb-2 text-sm font-semibold">Recent Commits</h3>
              <CommitList commits={commits} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-surface-1 p-4">
              <h3 className="mb-2 text-sm font-semibold">Important Files</h3>
              <div className="flex flex-col gap-2">
                {checkpoint.files.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 text-sm">
                    <ChangeTypeBadge changeType={f.changeType as ChangeType} />
                    <span className="truncate font-mono text-xs text-text-secondary">{f.filePath}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
