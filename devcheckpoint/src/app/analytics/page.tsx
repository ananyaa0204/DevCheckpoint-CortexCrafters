import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { AnalyticsView } from "@/components/analytics/analytics-view";
import { getAnalytics } from "@/lib/analytics/analytics";
import type { DateRangeOption } from "@/lib/analytics/types";

const VALID_RANGES: DateRangeOption[] = ["7d", "30d", "all"];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; projectId?: string }>;
}) {
  const params = await searchParams;
  const range: DateRangeOption = VALID_RANGES.includes(params.range as DateRangeOption)
    ? (params.range as DateRangeOption)
    : "30d";
  const projectId = params.projectId ?? null;

  const data = await getAnalytics({ range, projectId });

  return (
    <AppShell>
      <PageHeader
        title="Analytics"
        description="Development activity across your local projects."
      />
      <AnalyticsView initialData={data} />
    </AppShell>
  );
}
