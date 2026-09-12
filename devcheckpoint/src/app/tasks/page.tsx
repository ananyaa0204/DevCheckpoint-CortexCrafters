import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge } from "@/components/shared/status-badge";
import { formatRelativeTime } from "@/lib/utils";
import { listAllTasks } from "@/lib/actions/tasks";

export default async function TasksPage() {
  const tasks = await listAllTasks();

  return (
    <AppShell>
      <div className="mb-6 flex items-start justify-between">
        <PageHeader title="Tasks" description="What you're currently working on." />
        <Button render={<Link href="/tasks/new" />}>New Task</Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Create a task so DevCheckpoint knows what you're working on."
        />
      ) : (
        <div className="flex flex-col rounded-lg border border-border bg-surface-1">
          {tasks.map((t) => (
            <Link
              key={t.id}
              href={`/tasks/${t.id}`}
              className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0 hover:bg-surface-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{t.title}</p>
                <p className="truncate text-xs text-text-muted">
                  {t.project.name}
                  {t.branch ? ` · ${t.branch}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-text-muted">{formatRelativeTime(t.updatedAt)}</span>
                <TaskStatusBadge status={t.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
