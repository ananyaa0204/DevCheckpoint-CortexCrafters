import type { AnalyticsData } from "./types";

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function row(...cells: (string | number)[]): string {
  return cells.map(csvCell).join(",");
}

/**
 * Flattens the Analytics view into one CSV: overview counts, task status,
 * project activity, AI health, and frequently captured file paths. Never
 * includes file contents, source code, or secrets — only metadata already
 * shown on the Analytics page.
 */
export function buildAnalyticsCsv(data: AnalyticsData): string {
  const lines: string[] = [];
  lines.push(row("Section", "Metric", "Value"));

  lines.push(row("Filters", "Date Range", data.filters.range));
  lines.push(
    row(
      "Filters",
      "Project",
      data.filters.projectId
        ? (data.projectOptions.find((p) => p.id === data.filters.projectId)?.name ?? data.filters.projectId)
        : "All Projects"
    )
  );

  lines.push(row("Overview", "Projects", data.overview.projects));
  lines.push(row("Overview", "Active Tasks", data.overview.activeTasks));
  lines.push(row("Overview", "Completed Tasks", data.overview.completedTasks));
  lines.push(row("Overview", "Checkpoints", data.overview.checkpoints));
  lines.push(row("Overview", "Handoffs", data.overview.handoffs));
  lines.push(row("Overview", "AI Summaries", data.overview.aiSummaries));

  lines.push(row("Task Status", "Active", data.taskStatus.active));
  lines.push(row("Task Status", "Paused", data.taskStatus.paused));
  lines.push(row("Task Status", "Completed", data.taskStatus.completed));

  lines.push(row("AI Health", "Attempts", data.aiHealth.attempts));
  lines.push(row("AI Health", "Completed", data.aiHealth.completed));
  lines.push(row("AI Health", "Failed", data.aiHealth.failed));
  lines.push(row("AI Health", "Pending", data.aiHealth.pending));
  lines.push(row("AI Health", "Skipped", data.aiHealth.skipped));
  lines.push(row("AI Health", "Success Rate (%)", data.aiHealth.successRate ?? "N/A"));

  for (const project of data.projectActivity) {
    lines.push(row("Project Activity", project.projectName, project.count));
  }

  lines.push(row("Context Stats", "Total Changed-File Records", data.contextStats.totalRecords));
  lines.push(row("Context Stats", "Unique Files", data.contextStats.uniqueFiles));
  lines.push(row("Context Stats", "Avg Files / Checkpoint", data.contextStats.avgFilesPerCheckpoint));

  for (const file of data.contextStats.topFiles) {
    lines.push(row("Frequent Files", file.path, file.count));
  }

  lines.push(
    row(
      "Context Freshness",
      "Last Checkpoint",
      data.contextFreshness.lastCheckpointAt ? data.contextFreshness.lastCheckpointAt.toISOString() : "N/A"
    )
  );
  lines.push(row("Context Freshness", "Checkpoints Today", data.contextFreshness.checkpointsToday));
  lines.push(row("Context Freshness", "Checkpoints This Week", data.contextFreshness.checkpointsThisWeek));

  return lines.join("\n");
}
