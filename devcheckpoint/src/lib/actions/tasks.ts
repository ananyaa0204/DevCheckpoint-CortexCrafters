"use server";

import { prisma } from "@/lib/db/prisma";
import { startWatching, stopWatching } from "@/lib/watch/repo-watcher";

export type TaskStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

/** Starts/stops lightweight file-activity tracking for a project based on
 *  whether it currently has any ACTIVE task. Never scans outside the
 *  project's own repository root. */
async function syncProjectWatch(projectId: string): Promise<void> {
  const [activeCount, project] = await Promise.all([
    prisma.task.count({ where: { projectId, status: "ACTIVE" } }),
    prisma.project.findUnique({ where: { id: projectId } }),
  ]);
  if (!project) return;

  if (activeCount > 0) {
    startWatching(project.id, project.repoRoot);
  } else {
    await stopWatching(project.id);
  }
}

export async function createTask(input: {
  projectId: string;
  title: string;
  description?: string;
  branch?: string;
  notes?: string;
}) {
  const task = await prisma.task.create({
    data: {
      projectId: input.projectId,
      title: input.title,
      description: input.description || null,
      branch: input.branch || null,
      notes: input.notes || null,
      status: "ACTIVE",
    },
  });
  await syncProjectWatch(input.projectId);
  return task;
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const task = await prisma.task.update({
    where: { id },
    data: {
      status,
      closedAt: status === "COMPLETED" ? new Date() : null,
    },
  });
  await syncProjectWatch(task.projectId);
  return task;
}

export async function updateTaskNotes(id: string, notes: string) {
  return prisma.task.update({ where: { id }, data: { notes } });
}

export async function getTask(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: { project: true },
  });
}

export async function listTasksForProject(projectId: string) {
  return prisma.task.findMany({
    where: { projectId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listAllTasks() {
  return prisma.task.findMany({
    orderBy: { updatedAt: "desc" },
    include: { project: true },
  });
}

export async function getActiveTaskForProject(projectId: string) {
  return prisma.task.findFirst({
    where: { projectId, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
  });
}

/** Most recently updated ACTIVE task across all projects, for the Dashboard. */
export async function getCurrentActiveTask() {
  return prisma.task.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
    include: { project: true },
  });
}

export async function countActiveTasks() {
  return prisma.task.count({ where: { status: "ACTIVE" } });
}
