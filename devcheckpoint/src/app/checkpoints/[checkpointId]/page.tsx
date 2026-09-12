import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DetailHeader } from "@/components/layout/detail-header";
import { buttonVariants } from "@/components/ui/button";
import { CodeDiff } from "@/components/git/code-diff";
import { ChangeTypeBadge } from "@/components/shared/status-badge";
import { GenerationStatusBadge } from "@/components/checkpoints/generation-status-badge";
import { AiSummaryPanel } from "@/components/checkpoints/ai-summary-panel";
import { RegenerateSummaryButton } from "@/components/checkpoints/regenerate-summary-button";
import { CopySummaryButton } from "@/components/checkpoints/copy-summary-button";
import { formatRelativeTime, cn } from "@/lib/utils";
import { getCheckpoint } from "@/lib/actions/checkpoints";
import { CheckpointAiSchema } from "@/lib/ai/checkpoint-schema";
import type { ChangeType, CommitInfo } from "@/lib/git/types";

export default async function CheckpointDetailPage({
  params,
}: {
  params: Promise<{ checkpointId: string }>;
}) {
  const { checkpointId } = await params;
  const checkpoint = await getCheckpoint(checkpointId);
  if (!checkpoint) notFound();

  const commits: CommitInfo[] = checkpoint.commitsJson ? JSON.parse(checkpoint.commitsJson) : [];
  const aiSummary = checkpoint.aiSummaryJson
    ? CheckpointAiSchema.safeParse(JSON.parse(checkpoint.aiSummaryJson))
    : null;
  const summary = aiSummary?.success ? aiSummary.data : null;

  return (
    <AppShell>
      <DetailHeader
        backHref={`/tasks/${checkpoint.taskId}`}
        backLabel="Back to Task"
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: checkpoint.task.project.name, href: `/projects/${checkpoint.task.projectId}` },
          { label: checkpoint.task.title, href: `/tasks/${checkpoint.taskId}` },
          { label: "Checkpoint" },
        ]}
        title={checkpoint.task.title}
        description={
          <span className={cn("flex items-center gap-2")}>
            {checkpoint.branch ?? "unknown branch"} · saved {formatRelativeTime(checkpoint.createdAt)}
            <GenerationStatusBadge status={checkpoint.generationStatus} />
          </span>
        }
        actions={
          <>
            <CopySummaryButton
              taskTitle={checkpoint.task.title}
              branch={checkpoint.branch}
              developerNote={checkpoint.developerNote}
              changedFiles={checkpoint.files.map((f) => f.filePath)}
              summary={summary}
            />
            <Link
              href={`/handoffs/new?checkpointId=${checkpoint.id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Create Handoff
            </Link>
            <Link href={`/tasks/${checkpoint.taskId}/resume`} className={buttonVariants({ variant: "default" })}>
              Resume Task
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4">
          {summary ? (
            <AiSummaryPanel summary={summary} />
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-surface-1 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">No AI summary yet</p>
                <p className="text-xs text-text-muted">
                  {checkpoint.generationError ??
                    "Generate a structured summary from this checkpoint's captured context."}
                </p>
              </div>
              <RegenerateSummaryButton checkpointId={checkpoint.id} />
            </div>
          )}

          {checkpoint.developerNote && (
            <div className="rounded-lg border border-border bg-surface-1 p-4">
              <h2 className="mb-2 text-sm font-semibold">Developer Note</h2>
              <p className="text-sm text-text-secondary">{checkpoint.developerNote}</p>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-border bg-surface-1">
            <div className="border-b border-border px-3 py-2.5 text-sm font-medium">Diff at time of save</div>
            <CodeDiff diff={checkpoint.diffText ?? ""} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-surface-1 p-4">
            <h2 className="mb-2 text-sm font-semibold">Changed Files ({checkpoint.files.length})</h2>
            <div className="flex flex-col gap-2">
              {checkpoint.files.map((f) => (
                <div key={f.id} className="flex items-center gap-2 text-sm">
                  <ChangeTypeBadge changeType={f.changeType as ChangeType} />
                  <span className="truncate font-mono text-xs text-text-secondary">{f.filePath}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface-1 p-4">
            <h2 className="mb-2 text-sm font-semibold">Commits at time of save</h2>
            {commits.length === 0 ? (
              <p className="text-xs text-text-muted">No commits captured.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {commits.map((c) => (
                  <p key={c.hash} className="truncate text-xs text-text-secondary">
                    <span className="font-mono text-text-muted">{c.hash}</span> {c.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
