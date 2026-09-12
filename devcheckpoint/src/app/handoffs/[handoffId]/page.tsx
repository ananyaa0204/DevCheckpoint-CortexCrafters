import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DetailHeader } from "@/components/layout/detail-header";
import { HandoffPreview } from "@/components/handoffs/handoff-preview";
import { formatRelativeTime } from "@/lib/utils";
import { getHandoff } from "@/lib/actions/handoff";

export default async function HandoffDetailPage({
  params,
}: {
  params: Promise<{ handoffId: string }>;
}) {
  const { handoffId } = await params;
  const handoff = await getHandoff(handoffId);
  if (!handoff) notFound();

  return (
    <AppShell>
      <DetailHeader
        backHref="/handoffs"
        backLabel="Back to Handoffs"
        breadcrumbs={[
          { label: "Handoffs", href: "/handoffs" },
          { label: handoff.task.project.name, href: `/projects/${handoff.task.projectId}` },
          { label: handoff.task.title },
        ]}
        title={handoff.task.title}
        description={`Saved ${formatRelativeTime(handoff.createdAt)}`}
      />
      <HandoffPreview markdown={handoff.markdown} />
    </AppShell>
  );
}
