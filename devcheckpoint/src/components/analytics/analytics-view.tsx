"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import {
  FolderGit2,
  ListTodo,
  CheckCircle2,
  BookmarkCheck,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { BarChart } from "@/components/analytics/bar-chart";
import { TaskStatusBar } from "@/components/analytics/task-status-bar";
import { formatRelativeTime } from "@/lib/utils";
import { getAnalytics } from "@/lib/analytics/analytics";
import { buildAnalyticsCsv } from "@/lib/analytics/csv";
import type { AnalyticsData, DateRangeOption } from "@/lib/analytics/types";

const RANGE_LABELS: Record<DateRangeOption, string> = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  all: "All Time",
};

export function AnalyticsView({ initialData }: { initialData: AnalyticsData }) {
  const [data, setData] = useState(initialData);
  const [range, setRange] = useState<DateRangeOption>(initialData.filters.range);
  const [projectId, setProjectId] = useState<string | null>(initialData.filters.projectId);
  const [isPending, startTransition] = useTransition();

  function refresh(nextRange: DateRangeOption, nextProjectId: string | null) {
    startTransition(async () => {
      const result = await getAnalytics({ range: nextRange, projectId: nextProjectId });
      setData(result);
    });
  }

  function handleRangeChange(value: string | null) {
    if (!value) return;
    const next = value as DateRangeOption;
    setRange(next);
    refresh(next, projectId);
  }

  function handleProjectChange(value: string | null) {
    const next = value === "all" ? null : value;
    setProjectId(next);
    refresh(range, next);
  }

  function handleExport() {
    try {
      const csv = buildAnalyticsCsv(data);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devcheckpoint-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Analytics exported");
    } catch {
      toast.error("Could not export analytics.");
    }
  }

  if (data.overview.projects === 0) {
    return (
      <EmptyState
        title="No development activity yet"
        description="Create your first task to begin building development activity."
      />
    );
  }

  const stats = [
    { icon: FolderGit2, label: "Projects", value: data.overview.projects, color: "text-primary" },
    { icon: ListTodo, label: "Active Tasks", value: data.overview.activeTasks, color: "text-success" },
    { icon: CheckCircle2, label: "Completed Tasks", value: data.overview.completedTasks, color: "text-neutral" },
    { icon: BookmarkCheck, label: "Checkpoints", value: data.overview.checkpoints, color: "text-purple" },
    { icon: Share2, label: "Handoffs", value: data.overview.handoffs, color: "text-cyan" },
    { icon: Sparkles, label: "AI Summaries", value: data.overview.aiSummaries, color: "text-info" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={projectId ?? "all"} onValueChange={handleProjectChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {data.projectOptions.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={range} onValueChange={handleRangeChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">{RANGE_LABELS["7d"]}</SelectItem>
            <SelectItem value="30d">{RANGE_LABELS["30d"]}</SelectItem>
            <SelectItem value="all">{RANGE_LABELS.all}</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download /> Export Analytics
        </Button>

        {isPending && <Loader2 className="size-4 animate-spin text-text-muted" />}
      </div>

      {/* Row 1 — overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-1 p-3.5"
          >
            <s.icon className={`size-4 shrink-0 ${s.color}`} />
            <div className="min-w-0">
              <p className="text-lg font-semibold text-foreground">{s.value}</p>
              <p className="truncate text-[11px] text-text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2 — activity chart + task status */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-border bg-surface-1 p-4">
          <h2 className="mb-3 text-sm font-semibold">Development Activity</h2>
          {data.overview.checkpoints === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">No checkpoints in this period.</p>
          ) : (
            <BarChart data={data.checkpointActivity} />
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface-1 p-4">
          <h2 className="mb-3 text-sm font-semibold">Task Status</h2>
          <TaskStatusBar status={data.taskStatus} />
        </div>
      </div>

      {/* Row 3 — most active projects + AI health */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface-1 p-4">
          <h2 className="mb-3 text-sm font-semibold">Most Active Projects</h2>
          {data.projectActivity.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">No checkpoints in this period.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.projectActivity.map((p) => (
                <div key={p.projectId} className="flex items-center justify-between text-sm">
                  <span className="truncate text-text-secondary">{p.projectName}</span>
                  <span className="shrink-0 font-medium text-foreground">
                    {p.count} checkpoint{p.count === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface-1 p-4">
          <h2 className="mb-3 text-sm font-semibold">Local AI Health</h2>
          {!data.aiHealth.hasData ? (
            <p className="py-6 text-center text-sm text-text-muted">No local AI generation data yet.</p>
          ) : (
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Success rate</span>
                <span className="font-medium text-foreground">
                  {data.aiHealth.successRate === null ? "N/A" : `${data.aiHealth.successRate}%`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Attempts</span>
                <span className="text-foreground">{data.aiHealth.attempts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Completed</span>
                <span className="text-success">{data.aiHealth.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Failed</span>
                <span className="text-danger">{data.aiHealth.failed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Skipped (Ollama unavailable)</span>
                <span className="text-text-muted">{data.aiHealth.skipped}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 4 — context stats + frequent files */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface-1 p-4">
          <h2 className="mb-3 text-sm font-semibold">Context Statistics</h2>
          {data.contextStats.totalRecords === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">No changed files captured yet.</p>
          ) : (
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Changed-file records</span>
                <span className="text-foreground">{data.contextStats.totalRecords}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Unique files</span>
                <span className="text-foreground">{data.contextStats.uniqueFiles}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Avg files / checkpoint</span>
                <span className="text-foreground">{data.contextStats.avgFilesPerCheckpoint}</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface-1 p-4">
          <h2 className="mb-3 text-sm font-semibold">Frequently Captured Files</h2>
          {data.contextStats.topFiles.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">No changed files captured yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.contextStats.topFiles.map((f) => (
                <div key={f.path} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-mono text-xs text-text-secondary">{f.path}</span>
                  <span className="shrink-0 font-medium text-foreground">
                    {f.count} checkpoint{f.count === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Context freshness */}
      <div className="rounded-lg border border-border bg-surface-1 p-4">
        <h2 className="mb-3 text-sm font-semibold">Context Freshness</h2>
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-text-muted">Last checkpoint</p>
            <p className="text-foreground">
              {data.contextFreshness.lastCheckpointAt
                ? formatRelativeTime(data.contextFreshness.lastCheckpointAt)
                : "No checkpoints yet"}
            </p>
          </div>
          <div>
            <p className="text-text-muted">Checkpoints today</p>
            <p className="text-foreground">{data.contextFreshness.checkpointsToday}</p>
          </div>
          <div>
            <p className="text-text-muted">Checkpoints this week</p>
            <p className="text-foreground">{data.contextFreshness.checkpointsThisWeek}</p>
          </div>
        </div>
      </div>

      {/* Row 5 — recent activity */}
      <div className="rounded-lg border border-border bg-surface-1 p-4">
        <h2 className="mb-3 text-sm font-semibold">Recent Development Activity</h2>
        {data.recentActivity.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-muted">No development activity yet.</p>
        ) : (
          <div className="flex flex-col">
            {data.recentActivity.map((a) => (
              <Link
                key={a.id}
                href={a.href}
                className="flex items-center justify-between gap-2 border-b border-border-subtle py-2.5 last:border-b-0 hover:opacity-80"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{a.title}</p>
                  <p className="truncate text-xs text-text-muted">{a.subtitle}</p>
                </div>
                <span className="shrink-0 text-xs text-text-muted">{formatRelativeTime(a.timestamp)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
