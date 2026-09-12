import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function AnalyticsPage() {
  return (
    <AppShell>
      <PageHeader title="Analytics" description="Optional development insights." />
      <EmptyState
        title="Analytics are not implemented yet"
        description="This is a secondary-priority screen and ships after the core checkpoint workflow is stable."
      />
    </AppShell>
  );
}
