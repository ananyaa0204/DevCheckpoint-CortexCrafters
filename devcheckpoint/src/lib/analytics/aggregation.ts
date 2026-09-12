import type {
  AiHealth,
  ChartPoint,
  ContextFreshness,
  ContextStats,
  DateRangeOption,
  ProjectActivity,
  TaskStatusCounts,
} from "./types";

const DAY_MS = 86_400_000;

/** Start of the selected window, or null for "all" (no lower bound). */
export function getRangeStart(range: DateRangeOption, now: Date = new Date()): Date | null {
  if (range === "all") return null;
  const days = range === "7d" ? 6 : 29; // inclusive of "today"
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - days);
  return start;
}

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toWeekKey(date: Date): string {
  // Monday of the ISO week containing `date`, as a day key.
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dow = d.getUTCDay(); // 0 = Sunday
  const diffToMonday = dow === 0 ? 6 : dow - 1;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  return toDayKey(d);
}

function toMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatDayLabel(dayKey: string): string {
  const d = new Date(`${dayKey}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(d);
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(d);
}

/**
 * Buckets checkpoint timestamps for the activity chart. 7/30-day ranges
 * always produce one bucket per calendar day (including zero-count days)
 * so the chart never has gaps. "all" time picks day/week/month grouping
 * based on the actual span so we never render hundreds of labels.
 */
export function bucketCheckpointActivity(
  dates: Date[],
  range: DateRangeOption,
  now: Date = new Date()
): ChartPoint[] {
  if (range === "7d" || range === "30d") {
    const days = range === "7d" ? 7 : 30;
    const counts = new Map<string, number>();
    const order: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      d.setUTCDate(d.getUTCDate() - i);
      const key = toDayKey(d);
      counts.set(key, 0);
      order.push(key);
    }
    for (const date of dates) {
      const key = toDayKey(date);
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return order.map((key) => ({ label: formatDayLabel(key), count: counts.get(key) ?? 0 }));
  }

  if (dates.length === 0) return [];

  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const spanDays = (now.getTime() - sorted[0].getTime()) / DAY_MS;
  const granularity: "day" | "week" | "month" = spanDays <= 45 ? "day" : spanDays <= 180 ? "week" : "month";

  const counts = new Map<string, number>();
  for (const date of dates) {
    const key =
      granularity === "day" ? toDayKey(date) : granularity === "week" ? toWeekKey(date) : toMonthKey(date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, count]) => ({
      label: granularity === "month" ? formatMonthLabel(key) : formatDayLabel(key),
      count,
    }));
}

/** Reduces Prisma's `task.groupBy` result into the three real statuses. */
export function computeTaskStatusCounts(groups: { status: string; count: number }[]): TaskStatusCounts {
  const result: TaskStatusCounts = { active: 0, paused: 0, completed: 0 };
  for (const g of groups) {
    if (g.status === "ACTIVE") result.active = g.count;
    else if (g.status === "PAUSED") result.paused = g.count;
    else if (g.status === "COMPLETED") result.completed = g.count;
  }
  return result;
}

/** Ranks projects by checkpoint count, most active first. */
export function rankProjectActivity(
  items: { projectId: string; projectName: string }[],
  limit = 5
): ProjectActivity[] {
  const counts = new Map<string, { projectName: string; count: number }>();
  for (const item of items) {
    const existing = counts.get(item.projectId);
    if (existing) existing.count += 1;
    else counts.set(item.projectId, { projectName: item.projectName, count: 1 });
  }
  return [...counts.entries()]
    .map(([projectId, v]) => ({ projectId, projectName: v.projectName, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * SKIPPED means Ollama was intentionally unavailable/model missing — no
 * generation was attempted, so it's excluded from `attempts` and from the
 * success-rate denominator, but still reported on its own.
 */
export function computeAiHealth(statuses: string[]): AiHealth {
  let completed = 0;
  let failed = 0;
  let pending = 0;
  let skipped = 0;

  for (const status of statuses) {
    if (status === "COMPLETED") completed++;
    else if (status === "FAILED") failed++;
    else if (status === "SKIPPED") skipped++;
    else if (status === "PENDING" || status === "GENERATING") pending++;
  }

  const attempts = completed + failed + pending;
  return {
    attempts,
    completed,
    failed,
    pending,
    skipped,
    successRate: attempts > 0 ? Math.round((completed / attempts) * 1000) / 10 : null,
    hasData: statuses.length > 0,
  };
}

/** "Most frequently captured files" counts distinct checkpoints per path,
 *  not raw ChangedFile rows, so a file isn't over-counted within one save. */
export function computeContextStats(
  files: { filePath: string; checkpointId: string }[],
  checkpointCount: number,
  topN = 5
): ContextStats {
  const perFile = new Map<string, Set<string>>();
  for (const f of files) {
    const set = perFile.get(f.filePath) ?? new Set<string>();
    set.add(f.checkpointId);
    perFile.set(f.filePath, set);
  }

  const topFiles = [...perFile.entries()]
    .map(([path, checkpoints]) => ({ path, count: checkpoints.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);

  return {
    totalRecords: files.length,
    uniqueFiles: perFile.size,
    avgFilesPerCheckpoint: checkpointCount > 0 ? Math.round((files.length / checkpointCount) * 10) / 10 : 0,
    topFiles,
  };
}

/** Freshness is always computed over ALL of a project's checkpoints,
 *  independent of the selected date-range filter — it answers "how
 *  recently did I save anything", not "within the browsed period". */
export function buildContextFreshness(dates: Date[], now: Date = new Date()): ContextFreshness {
  if (dates.length === 0) {
    return { lastCheckpointAt: null, checkpointsToday: 0, checkpointsThisWeek: 0 };
  }

  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const startOfWeek = new Date(startOfToday.getTime() - 6 * DAY_MS);

  let latest = dates[0];
  let checkpointsToday = 0;
  let checkpointsThisWeek = 0;

  for (const date of dates) {
    if (date.getTime() > latest.getTime()) latest = date;
    if (date.getTime() >= startOfToday.getTime()) checkpointsToday++;
    if (date.getTime() >= startOfWeek.getTime()) checkpointsThisWeek++;
  }

  return { lastCheckpointAt: latest, checkpointsToday, checkpointsThisWeek };
}
