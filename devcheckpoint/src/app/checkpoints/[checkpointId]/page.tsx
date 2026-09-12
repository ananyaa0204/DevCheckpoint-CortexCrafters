import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { CodeDiff } from "@/components/git/code-diff";
import { ChangeTypeBadge } from "@/components/shared/status-badge";
import { formatRelativeTime } from "@/lib/utils";
import { getCheckpoint } from "@/lib/actions/checkpoints";
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

  return (
    <AppShell>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs text-text-muted">
            <Link href="/checkpoints" className="hover:underline">
              Checkpoints
            </Link>{" "}
            / {checkpoint.task.project.name}
          </p>
          <h1 className="text-xl font-semibold text-foreground">{checkpoint.task.title}</h1>
          <p className="mt-0.5 text-xs text-text-muted">
            {checkpoint.branch ?? "unknown branch"} · saved {formatRelativeTime(checkpoint.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" render={<Link href={`/handoffs/new?checkpointId=${checkpoint.id}`} />}>
            Create Handoff
          </Button>
          <Button render={<Link href={`/tasks/${checkpoint.taskId}/resume`} />}>Resume Task</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4">
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
