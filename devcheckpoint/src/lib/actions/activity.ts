"use server";

import { prisma } from "@/lib/db/prisma";
import { getRecentFileActivity, isWatchingProject } from "@/lib/watch/repo-watcher";

export async function getFileActivity(projectId: string) {
  return {
    watching: isWatchingProject(projectId),
    events: getRecentFileActivity(projectId),
  };
}

export type ActivityItem = {
  id: string;
  kind: "task" | "checkpoint" | "handoff";
  title: string;
  subtitle: string;
  timestamp: Date;
  href: string;
};

/**
 * A merged, most-recent-first feed across tasks, checkpoints, and
 * handoffs. Shared by the Dashboard and Analytics — do not duplicate this
 * query elsewhere. `projectId` scopes every source to one project;
 * omit it for the global feed.
 */
export async function getRecentActivity(
  options: { limit?: number; projectId?: string } = {}
): Promise<ActivityItem[]> {
  const { limit = 8, projectId } = options;
  const taskFilter = projectId ? { projectId } : {};
  const viaTaskFilter = projectId ? { task: { projectId } } : {};

  const [tasks, checkpoints, handoffs] = await Promise.all([
    prisma.task.findMany({
      where: taskFilter,
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: { project: true },
    }),
    prisma.checkpoint.findMany({
      where: viaTaskFilter,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { task: { include: { project: true } } },
    }),
    prisma.handoff.findMany({
      where: viaTaskFilter,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { task: { include: { project: true } } },
    }),
  ]);

  const items: ActivityItem[] = [
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      kind: "task" as const,
      title: `Task ${t.status === "ACTIVE" ? "started" : t.status.toLowerCase()}: ${t.title}`,
      subtitle: t.project.name,
      timestamp: t.updatedAt,
      href: `/tasks/${t.id}`,
    })),
    ...checkpoints.map((c) => ({
      id: `checkpoint-${c.id}`,
      kind: "checkpoint" as const,
      title: `Checkpoint saved: ${c.task.title}`,
      subtitle: c.task.project.name,
      timestamp: c.createdAt,
      href: `/checkpoints/${c.id}`,
    })),
    ...handoffs.map((h) => ({
      id: `handoff-${h.id}`,
      kind: "handoff" as const,
      title: `Handoff saved: ${h.task.title}`,
      subtitle: h.task.project.name,
      timestamp: h.createdAt,
      href: `/handoffs/${h.id}`,
    })),
  ];

  return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
}
