import { AppShell } from "@/components/layout/app-shell";
import { BackButton } from "@/components/layout/back-button";
import { DetailHeader } from "@/components/layout/detail-header";
import { EmptyState } from "@/components/shared/empty-state";
import { HandoffPreview } from "@/components/handoffs/handoff-preview";
import { buildHandoff } from "@/lib/actions/handoff";

export default async function CreateHandoffPage({
  searchParams,
}: {
  searchParams: Promise<{ checkpointId?: string }>;
}) {
  const { checkpointId } = await searchParams;

  if (!checkpointId) {
    return (
      <AppShell>
        <BackButton href="/handoffs" label="Back to Handoffs" />
        <div className="mt-4">
          <EmptyState title="No checkpoint selected" description="Go to Handoffs and pick a checkpoint to hand off." />
        </div>
      </AppShell>
    );
  }

  const { markdown, checkpoint } = await buildHandoff(checkpointId);

  return (
    <AppShell>
      <DetailHeader
        backHref={`/checkpoints/${checkpointId}`}
        backLabel="Back to Checkpoint"
        breadcrumbs={[
          { label: "Tasks", href: "/tasks" },
          { label: checkpoint.task.title, href: `/tasks/${checkpoint.taskId}` },
          { label: "Create Handoff" },
        ]}
        title="Create Handoff"
        description={`Share context for "${checkpoint.task.title}" with another developer.`}
      />
      <HandoffPreview markdown={markdown} checkpointId={checkpointId} />
    </AppShell>
  );
}
