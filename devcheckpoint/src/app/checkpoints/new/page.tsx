import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { BackButton } from "@/components/layout/back-button";
import { DetailHeader } from "@/components/layout/detail-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { SaveCheckpointForm } from "@/components/checkpoints/save-checkpoint-form";
import { getTask, listAllTasks } from "@/lib/actions/tasks";
import { getGitContext } from "@/lib/git/git-client";

export default async function SaveCheckpointPage({
  searchParams,
}: {
  searchParams: Promise<{ taskId?: string }>;
}) {
  const { taskId } = await searchParams;

  if (!taskId) {
    const tasks = await listAllTasks();
    const openTasks = tasks.filter((t) => t.status !== "COMPLETED");

    return (
      <AppShell>
        <BackButton href="/checkpoints" label="Back to Checkpoints" />
        <PageHeader title="Save Checkpoint" description="Choose a task to capture its current state." />
        {openTasks.length === 0 ? (
          <EmptyState
            title="No open tasks"
            description="Start a task before saving a checkpoint."
          />
        ) : (
          <div className="flex flex-col rounded-lg border border-border bg-surface-1">
            {openTasks.map((t) => (
              <Link
                key={t.id}
                href={`/checkpoints/new?taskId=${t.id}`}
                className="flex items-center justify-between border-b border-border-subtle px-4 py-3 last:border-b-0 hover:bg-surface-2"
              >
                <span className="text-sm text-foreground">{t.title}</span>
                <span className="text-xs text-text-muted">{t.project.name}</span>
              </Link>
            ))}
          </div>
        )}
      </AppShell>
    );
  }

  const task = await getTask(taskId);
  if (!task) {
    return (
      <AppShell>
        <ErrorState title="Task not found" message="This task may have been removed." />
      </AppShell>
    );
  }

  let gitError: string | null = null;
  let git = null;
  try {
    git = await getGitContext(task.project.repoRoot);
  } catch (err) {
    gitError = err instanceof Error ? err.message : "Could not read repository state.";
  }

  return (
    <AppShell>
      <DetailHeader
        backHref={`/tasks/${task.id}`}
        backLabel="Back to Task"
        breadcrumbs={[
          { label: "Tasks", href: "/tasks" },
          { label: task.title, href: `/tasks/${task.id}` },
          { label: "Save Checkpoint" },
        ]}
        title="Save Checkpoint"
        description="Capture your current state so you can resume it later."
      />

      {gitError ? (
        <ErrorState title="Repository path is unavailable" message={gitError} />
      ) : git ? (
        <SaveCheckpointForm taskId={task.id} projectId={task.projectId} initialGit={git} />
      ) : null}
    </AppShell>
  );
}
