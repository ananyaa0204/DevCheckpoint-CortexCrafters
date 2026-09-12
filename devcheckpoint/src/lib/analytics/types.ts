import type { ActivityItem } from "@/lib/actions/activity";

export type DateRangeOption = "7d" | "30d" | "all";

export type ChartPoint = { label: string; count: number };

export type AiHealth = {
  /** COMPLETED + FAILED + PENDING/GENERATING — checkpoints where Ollama was
   *  actually invoked. SKIPPED (Ollama unavailable/model missing) is
   *  intentionally excluded from the denominator since no attempt was made. */
  attempts: number;
  completed: number;
  failed: number;
  pending: number;
  skipped: number;
  /** 0-100, rounded to 1 decimal. Null when attempts === 0. */
  successRate: number | null;
  /** True as soon as there is at least one checkpoint in scope, even if
   *  every one of them was SKIPPED. */
  hasData: boolean;
};

export type ContextStats = {
  totalRecords: number;
  uniqueFiles: number;
  avgFilesPerCheckpoint: number;
  topFiles: { path: string; count: number }[];
};

export type ContextFreshness = {
  lastCheckpointAt: Date | null;
  checkpointsToday: number;
  checkpointsThisWeek: number;
};

export type ProjectActivity = { projectId: string; projectName: string; count: number };

export type TaskStatusCounts = { active: number; paused: number; completed: number };

export type AnalyticsFilters = { range: DateRangeOption; projectId: string | null };

export type AnalyticsData = {
  filters: AnalyticsFilters;
  projectOptions: { id: string; name: string }[];
  overview: {
    projects: number;
    activeTasks: number;
    completedTasks: number;
    checkpoints: number;
    handoffs: number;
    aiSummaries: number;
  };
  checkpointActivity: ChartPoint[];
  taskStatus: TaskStatusCounts;
  projectActivity: ProjectActivity[];
  aiHealth: AiHealth;
  contextStats: ContextStats;
  contextFreshness: ContextFreshness;
  recentActivity: ActivityItem[];
};
