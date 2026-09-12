"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GitStatCards } from "@/components/git/git-stat-cards";
import { CommitList } from "@/components/git/commit-list";
import { FileDiffExplorer } from "@/components/git/file-diff-explorer";
import { FileActivityPanel } from "@/components/projects/file-activity-panel";
import { TaskStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { GitContext } from "@/lib/git/types";

type TaskSummary = {
  id: string;
  title: string;
  status: string;
  notes: string | null;
};

export function ProjectWorkspace({
  projectId,
  git,
  tasks,
}: {
  projectId: string;
  git: GitContext;
  tasks: TaskSummary[];
}) {
  const activeTask = tasks.find((t) => t.status === "ACTIVE") ?? null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        <Tabs defaultValue="overview">
          <TabsList variant="line" className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex flex-col gap-5">
            <GitStatCards
              branch={git.branch}
              filesCount={git.files.length}
              isClean={git.isClean}
              lastCommitDate={git.commits[0]?.date ?? null}
              filesTruncated={git.filesTruncated}
              totalFilesChanged={git.totalFilesChanged}
            />

            <FileDiffExplorer projectId={projectId} files={git.files} />

            <div className="rounded-lg border border-border bg-surface-1 p-4">
              <h3 className="mb-2 text-sm font-semibold">Recent Commits</h3>
              <CommitList commits={git.commits} />
            </div>

            <FileActivityPanel projectId={projectId} />
          </TabsContent>

          <TabsContent value="tasks" className="flex flex-col gap-3">
            {tasks.length === 0 ? (
              <EmptyState
                title="No tasks yet"
                description="Create a task so DevCheckpoint knows what you're working on."
              />
            ) : (
              tasks.map((t) => (
                <Link
                  key={t.id}
                  href={`/tasks/${t.id}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-1 p-3 hover:bg-surface-2"
                >
                  <span className="text-sm text-foreground">{t.title}</span>
                  <TaskStatusBadge status={t.status} />
                </Link>
              ))
            )}
            <Link
              href={`/tasks/new?projectId=${projectId}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
            >
              Start New Task
            </Link>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-border bg-surface-1 p-4">
          <h3 className="mb-3 text-sm font-semibold">Active Task</h3>
          {activeTask ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">{activeTask.title}</p>
              {activeTask.notes && <p className="text-xs text-text-secondary">{activeTask.notes}</p>}
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  href={`/checkpoints/new?taskId=${activeTask.id}`}
                  className={buttonVariants({ size: "sm" })}
                >
                  Save Checkpoint
                </Link>
                <Link
                  href={`/tasks/${activeTask.id}/resume`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Resume Task
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-text-muted">No active task for this project.</p>
              <Link href={`/tasks/new?projectId=${projectId}`} className={buttonVariants({ size: "sm" })}>
                Start Task
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
