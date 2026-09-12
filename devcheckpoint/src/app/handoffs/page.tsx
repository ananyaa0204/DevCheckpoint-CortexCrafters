import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import { listHandoffs } from "@/lib/actions/handoff";
import { listAllCheckpoints } from "@/lib/actions/checkpoints";

export default async function HandoffsPage() {
  const [handoffs, checkpoints] = await Promise.all([listHandoffs(), listAllCheckpoints()]);

  return (
    <AppShell>
      <div className="mb-6 flex items-start justify-between">
        <PageHeader title="Handoffs" description="Share complete context with another developer." />
        {checkpoints.length > 0 && (
          <Link href={`/handoffs/new?checkpointId=${checkpoints[0].id}`} className={buttonVariants()}>
            Create Handoff
          </Link>
        )}
      </div>

      {handoffs.length === 0 ? (
        <div className="flex flex-col gap-4">
          <EmptyState
            title="No handoffs saved yet"
            description="Generate a handoff from a checkpoint and save it to keep a record here."
          />
          {checkpoints.length > 0 && (
            <div className="flex flex-col rounded-lg border border-border bg-surface-1">
              {checkpoints.slice(0, 8).map((c) => (
                <Link
                  key={c.id}
                  href={`/handoffs/new?checkpointId=${c.id}`}
                  className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0 hover:bg-surface-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{c.task.title}</p>
                    <p className="truncate text-xs text-text-muted">{c.task.project.name}</p>
                  </div>
                  <span className="shrink-0 text-xs text-text-muted">{formatRelativeTime(c.createdAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col rounded-lg border border-border bg-surface-1">
          {handoffs.map((h) => (
            <Link
              key={h.id}
              href={`/handoffs/${h.id}`}
              className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0 hover:bg-surface-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{h.task.title}</p>
                <p className="truncate text-xs text-text-muted">{h.task.project.name}</p>
              </div>
              <span className="shrink-0 text-xs text-text-muted">{formatRelativeTime(h.createdAt)}</span>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
