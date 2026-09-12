import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
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
        <PageHeader title="Create Handoff" description="Select a checkpoint from the Handoffs list." />
        <EmptyState title="No checkpoint selected" description="Go to Handoffs and pick a checkpoint to hand off." />
      </AppShell>
    );
  }

  const { markdown, checkpoint } = await buildHandoff(checkpointId);

  return (
    <AppShell>
      <PageHeader
        title="Create Handoff"
        description={`Share context for "${checkpoint.task.title}" with another developer.`}
      />
      <HandoffPreview markdown={markdown} />
    </AppShell>
  );
}
