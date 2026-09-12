import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, Code2, FileCode2, ListChecks, GitBranch } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { BackButton } from "@/components/layout/back-button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { ChangeTypeBadge } from "@/components/shared/status-badge";
import { GenerationStatusBadge } from "@/components/checkpoints/generation-status-badge";
import { CommitList } from "@/components/git/commit-list";
import { ResumeActions } from "@/components/tasks/resume-actions";
import { RegenerateSummaryButton } from "@/components/checkpoints/regenerate-summary-button";
import { MarkCompleteButton } from "@/components/tasks/mark-complete-button";
import { buttonVariants } from "@/components/ui/button";
import { formatRelativeTime, cn } from "@/lib/utils";
import { getTask } from "@/lib/actions/tasks";
import { getLatestCheckpointForTask } from "@/lib/actions/checkpoints";
import { getGitContext } from "@/lib/git/git-client";
import { CheckpointAiSchema } from "@/lib/ai/checkpoint-schema";
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
  const aiSummary =
    checkpoint?.aiSummaryJson && checkpoint.generationStatus === "COMPLETED"
      ? CheckpointAiSchema.safeParse(JSON.parse(checkpoint.aiSummaryJson))
      : null;
  const summary = aiSummary?.success ? aiSummary.data : null;

  let liveGit: Awaited<ReturnType<typeof getGitContext>> | null = null;
  let liveGitError: string | null = null;
  try {
    liveGit = await getGitContext(task.project.repoRoot);
  } catch (err) {
    liveGitError = err instanceof Error ? err.message : "Could not read repository state.";
  }

  const changedSinceCheckpoint =
    checkpoint && liveGit
      ? liveGit.branch !== checkpoint.branch ||
        liveGit.commits[0]?.hash !== commits[0]?.hash ||
        liveGit.files.length !== checkpoint.files.length
      : false;

  return (
    <AppShell>
      <div className="mb-1 flex flex-col gap-1">
        <BackButton href={`/tasks/${task.id}`} label="Back to Task" />
        <Breadcrumbs
          items={[
            { label: "Tasks", href: "/tasks" },
            { label: task.title, href: `/tasks/${task.id}` },
            { label: "Resume" },
          ]}
        />
      </div>
      <h1 className="mb-1 mt-2 text-2xl font-bold text-foreground">You were working on…</h1>
      <p className="mb-6 text-sm text-text-secondary">Pick up right where you left off.</p>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface-1 p-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">{task.title}</h2>
          <p className="flex items-center gap-1.5 text-xs text-text-muted">
            <GitBranch className="size-3.5" />
            {task.project.name}
            {task.branch ? ` · ${task.branch}` : ""}
            {checkpoint && ` · last checkpoint ${formatRelativeTime(checkpoint.createdAt)}`}
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
            <div className="flex items-center gap-2">
              <GenerationStatusBadge status={checkpoint.generationStatus} />
              {checkpoint.generationStatus !== "COMPLETED" && (
                <RegenerateSummaryButton checkpointId={checkpoint.id} />
              )}
            </div>

            <div className="rounded-lg border border-border bg-surface-1 p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <Code2 className="size-4 text-cyan" />
                <h3 className="text-sm font-semibold">What Changed</h3>
              </div>
              {summary && summary.changes.length > 0 ? (
                <ul className="ml-5 list-disc text-sm text-text-secondary">
                  {summary.changes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-secondary">
                  {checkpoint.files.length} file{checkpoint.files.length === 1 ? "" : "s"} changed:{" "}
                  {checkpoint.files.map((f) => f.filePath).join(", ") || "none captured"}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-surface-1 p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <AlertTriangle className="size-4 text-danger" />
                <h3 className="text-sm font-semibold">Where You Stopped</h3>
              </div>
              <p className="text-sm text-text-secondary">
                {summary?.blocker || checkpoint.developerNote || "No blocker recorded for this checkpoint."}
              </p>
            </div>

            {summary && summary.attempts.length > 0 && (
              <div className="rounded-lg border border-border bg-surface-1 p-4">
                <div className="mb-2 flex items-center gap-1.5">
                  <ListChecks className="size-4 text-info" />
                  <h3 className="text-sm font-semibold">What You Already Tried</h3>
                </div>
                <ul className="ml-5 list-disc text-sm text-text-secondary">
                  {summary.attempts.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-lg border border-border bg-surface-1 p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <ArrowRight className="size-4 text-success" />
                <h3 className="text-sm font-semibold">Next Step</h3>
              </div>
              <p className="text-sm text-text-secondary">
                {summary?.nextStep ||
                  "Generate an AI summary for a recommended next step, or save a new checkpoint."}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-1 p-4">
              <h3 className="mb-2 text-sm font-semibold">Recent Commits (at checkpoint time)</h3>
              <CommitList commits={commits} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-surface-1 p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <FileCode2 className="size-4 text-purple" />
                <h3 className="text-sm font-semibold">Important Files</h3>
              </div>
              <div className="flex flex-col gap-2">
                {(summary?.importantFiles.length
                  ? summary.importantFiles.map((path) => ({ filePath: path, changeType: "modified" as ChangeType, id: path }))
                  : checkpoint.files
                ).map((f) => (
                  <div key={f.id ?? f.filePath} className="flex items-center gap-2 text-sm">
                    <ChangeTypeBadge changeType={(f as { changeType: ChangeType }).changeType} />
                    <span className="truncate font-mono text-xs text-text-secondary">{f.filePath}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface-1 p-4">
              <h3 className="mb-2 text-sm font-semibold">Current Repository State</h3>
              {liveGitError ? (
                <p className="text-xs text-danger">{liveGitError}</p>
              ) : liveGit ? (
                <div className="flex flex-col gap-1.5 text-sm text-text-secondary">
                  <p>
                    Branch: <span className="font-mono text-foreground">{liveGit.branch ?? "—"}</span>
                  </p>
                  <p>
                    Changed files now: <span className="text-foreground">{liveGit.files.length}</span>
                  </p>
                  <p className={cn(changedSinceCheckpoint ? "text-warning" : "text-success")}>
                    {changedSinceCheckpoint
                      ? "Repository has changed since this checkpoint."
                      : "Repository matches this checkpoint."}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-1 p-4">
              <h3 className="mb-1 text-sm font-semibold">Quick Actions</h3>
              <Link href={`/projects/${task.projectId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Open Project
              </Link>
              <Link href={`/tasks/${task.id}/code`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                View Code Changes
              </Link>
              <Link
                href={`/checkpoints/new?taskId=${task.id}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Save New Checkpoint
              </Link>
              <Link
                href={`/handoffs/new?checkpointId=${checkpoint.id}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Create Handoff
              </Link>
              <MarkCompleteButton taskId={task.id} />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
