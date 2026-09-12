"use server";

import { prisma } from "@/lib/db/prisma";
import { getRecentActivity } from "@/lib/actions/activity";
import {
  bucketCheckpointActivity,
  buildContextFreshness,
  computeAiHealth,
  computeContextStats,
  computeTaskStatusCounts,
  getRangeStart,
  rankProjectActivity,
} from "@/lib/analytics/aggregation";
import type { AnalyticsData, AnalyticsFilters } from "@/lib/analytics/types";

/**
 * Everything here reads only the local SQLite database through Prisma.
 * No network requests, no Ollama calls, no filesystem/repository scans —
 * Analytics only summarizes metadata DevCheckpoint already stored.
 */
export async function getAnalytics(filters: AnalyticsFilters): Promise<AnalyticsData> {
  const since = getRangeStart(filters.range);
  const directProjectWhere = filters.projectId ? { projectId: filters.projectId } : {};
  const viaTaskWhere = filters.projectId ? { task: { projectId: filters.projectId } } : {};

  const [
    totalProjects,
    projectOptions,
    taskGroups,
    checkpointsInRange,
    handoffsCount,
    changedFilesInRange,
    allProjectScopedCheckpointDates,
    recentActivity,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.task.groupBy({ by: ["status"], where: directProjectWhere, _count: { _all: true } }),
    prisma.checkpoint.findMany({
      where: { ...(since ? { createdAt: { gte: since } } : {}), ...viaTaskWhere },
      select: {
        id: true,
        createdAt: true,
        generationStatus: true,
        task: { select: { project: { select: { id: true, name: true } } } },
      },
    }),
    prisma.handoff.count({ where: { ...(since ? { createdAt: { gte: since } } : {}), ...viaTaskWhere } }),
    prisma.changedFile.findMany({
      where: { checkpoint: { ...(since ? { createdAt: { gte: since } } : {}), ...viaTaskWhere } },
      select: { filePath: true, checkpointId: true },
    }),
    prisma.checkpoint.findMany({ where: viaTaskWhere, select: { createdAt: true } }),
    getRecentActivity({ projectId: filters.projectId ?? undefined, limit: 10 }),
  ]);

  const taskStatus = computeTaskStatusCounts(
    taskGroups.map((g) => ({ status: g.status, count: g._count._all }))
  );

  const aiHealth = computeAiHealth(checkpointsInRange.map((c) => c.generationStatus));

  return {
    filters,
    projectOptions,
    overview: {
      projects: totalProjects,
      activeTasks: taskStatus.active,
      completedTasks: taskStatus.completed,
      checkpoints: checkpointsInRange.length,
      handoffs: handoffsCount,
      aiSummaries: aiHealth.completed,
    },
    checkpointActivity: bucketCheckpointActivity(
      checkpointsInRange.map((c) => c.createdAt),
      filters.range
    ),
    taskStatus,
    projectActivity: rankProjectActivity(
      checkpointsInRange.map((c) => ({
        projectId: c.task.project.id,
        projectName: c.task.project.name,
      }))
    ),
    aiHealth,
    contextStats: computeContextStats(changedFilesInRange, checkpointsInRange.length),
    contextFreshness: buildContextFreshness(allProjectScopedCheckpointDates.map((c) => c.createdAt)),
    recentActivity,
  };
}
