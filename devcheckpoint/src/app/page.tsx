import Link from "next/link";
import { FolderGit2, ListTodo, BookmarkCheck, ArrowRight, Play } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge } from "@/components/shared/status-badge";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import { formatRelativeTime } from "@/lib/utils";
import { listProjects, countActiveProjects } from "@/lib/actions/projects";
import { countActiveTasks, getCurrentActiveTask } from "@/lib/actions/tasks";
import { countCheckpoints, listAllCheckpoints } from "@/lib/actions/checkpoints";
import { getProjectGitContext } from "@/lib/actions/git";

export default async function DashboardPage() {
  const [activeProjects, activeTasks, savedCheckpoints, activeTask, recentCheckpoints, recentProjects] =
    await Promise.all([
      countActiveProjects(),
      countActiveTasks(),
      countCheckpoints(),
      getCurrentActiveTask(),
      listAllCheckpoints(),
      listProjects(),
    ]);

  const activeTaskGit = activeTask ? await getProjectGitContext(activeTask.projectId) : null;
  const latestCheckpointForTask = recentCheckpoints.find((c) => c.taskId === activeTask?.id);

  const stats = [
    { icon: FolderGit2, value: activeProjects, label: "Projects", color: "text-primary" },
    { icon: ListTodo, value: activeTasks, label: "Active Tasks", color: "text-success" },
    { icon: BookmarkCheck, value: savedCheckpoints, label: "Saved Checkpoints", color: "text-purple" },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Pick up where you left off."
        description="Your development context, always at your fingertips."
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface-1 p-4"
          >
            <s.icon className={`size-5 ${s.color}`} />
            <div>
              <p className="text-2xl font-semibold text-foreground">{s.value}</p>
              <p className="text-xs text-text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-border bg-surface-1 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">Current Task</h2>
            {activeTask && (
              <Button size="sm" render={<Link href={`/tasks/${activeTask.id}/resume`} />}>
                <Play /> Resume
              </Button>
            )}
          </div>

          {activeTask ? (
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{activeTask.title}</h3>
                  <TaskStatusBadge status={activeTask.status} />
                </div>
                <p className="mt-0.5 text-sm text-text-muted">
                  {activeTask.project.name}
                  {activeTaskGit?.branch ? ` · ${activeTaskGit.branch}` : ""}
                </p>
              </div>

              {activeTask.notes && (
                <div className="rounded-md border border-border-subtle bg-surface-2 p-3 text-sm text-text-secondary">
                  {activeTask.notes}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" render={<Link href={`/projects/${activeTask.projectId}`} />}>
                  Open Project
                </Button>
                {latestCheckpointForTask && (
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/checkpoints/${latestCheckpointForTask.id}`} />}
                  >
                    View Last Checkpoint
                  </Button>
                )}
                <Button variant="outline" size="sm" render={<Link href={`/checkpoints/new?taskId=${activeTask.id}`} />}>
                  Save Checkpoint
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No active task"
              description="Start a task so DevCheckpoint knows what you're working on."
            />
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface-1 p-5">
          <h2 className="mb-3 text-[15px] font-semibold">Project Context</h2>
          {activeTask ? (
            <div className="flex flex-col gap-2 text-sm">
              <p className="font-medium text-foreground">{activeTask.project.name}</p>
              <p className="truncate font-mono text-xs text-text-muted">{activeTask.project.localPath}</p>
              <div className="mt-2 flex flex-col gap-1.5 text-text-secondary">
                <p>Branch: <span className="font-mono text-foreground">{activeTaskGit?.branch ?? "—"}</span></p>
                <p>Modified files: <span className="text-foreground">{activeTaskGit?.files.length ?? 0}</span></p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-muted">No active project context yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface-1 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">Recent Checkpoints</h2>
            <Link href="/checkpoints" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {recentCheckpoints.length === 0 ? (
            <p className="text-sm text-text-muted">No checkpoints saved yet.</p>
          ) : (
            <div className="flex flex-col">
              {recentCheckpoints.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  href={`/checkpoints/${c.id}`}
                  className="flex items-center justify-between gap-2 border-b border-border-subtle py-2.5 last:border-b-0 hover:opacity-80"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{c.task.title}</p>
                    <p className="truncate text-xs text-text-muted">{c.task.project.name}</p>
                  </div>
                  <span className="shrink-0 text-xs text-text-muted">
                    {formatRelativeTime(c.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface-1 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">Recent Projects</h2>
            <Link href="/projects" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Add a local Git repository to start saving development context."
            />
          ) : (
            <div className="flex flex-col">
              {recentProjects.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between gap-2 border-b border-border-subtle py-2.5 last:border-b-0 hover:opacity-80"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{p.name}</p>
                    <p className="truncate font-mono text-xs text-text-muted">{p.localPath}</p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-text-muted" />
                </Link>
              ))}
            </div>
          )}
          <div className="mt-3">
            <AddProjectDialog trigger={<Button variant="outline" size="sm">Add Project</Button>} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
