import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import { listAllCheckpoints } from "@/lib/actions/checkpoints";

export default async function CheckpointsPage() {
  const checkpoints = await listAllCheckpoints();

  return (
    <AppShell>
      <div className="mb-6 flex items-start justify-between">
        <PageHeader title="Checkpoints" description="Save your progress. Pick up right where you left off." />
        <Link href="/checkpoints/new" className={buttonVariants({ variant: "default" })}>
          New Checkpoint
        </Link>
      </div>

      {checkpoints.length === 0 ? (
        <EmptyState
          title="No checkpoints yet"
          description="Save your current development state so you can resume it later."
        />
      ) : (
        <div className="flex flex-col rounded-lg border border-border bg-surface-1">
          {checkpoints.map((c) => (
            <Link
              key={c.id}
              href={`/checkpoints/${c.id}`}
              className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0 hover:bg-surface-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{c.task.title}</p>
                <p className="truncate text-xs text-text-muted">
                  {c.task.project.name}
                  {c.branch ? ` · ${c.branch}` : ""}
                </p>
                {c.developerNote && (
                  <p className="mt-0.5 truncate text-xs text-text-secondary">{c.developerNote}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3 text-xs text-text-muted">
                <span>{c.files.length} files</span>
                <span>{formatRelativeTime(c.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
