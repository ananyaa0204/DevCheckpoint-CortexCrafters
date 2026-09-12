import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRelativeTime } from "@/lib/utils";
import { listAllCheckpoints } from "@/lib/actions/checkpoints";

export default async function HandoffsPage() {
  const checkpoints = await listAllCheckpoints();

  return (
    <AppShell>
      <PageHeader
        title="Handoffs"
        description="Generate a shareable summary from any saved checkpoint for another developer."
      />

      {checkpoints.length === 0 ? (
        <EmptyState
          title="No checkpoints to hand off yet"
          description="Save a checkpoint first, then generate a handoff from it."
        />
      ) : (
        <div className="flex flex-col rounded-lg border border-border bg-surface-1">
          {checkpoints.map((c) => (
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
    </AppShell>
  );
}
