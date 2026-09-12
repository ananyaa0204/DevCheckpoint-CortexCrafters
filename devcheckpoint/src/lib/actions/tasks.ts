"use server";

import { prisma } from "@/lib/db/prisma";

export type TaskStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

export async function createTask(input: {
  projectId: string;
  title: string;
  description?: string;
  branch?: string;
  notes?: string;
}) {
  return prisma.task.create({
    data: {
      projectId: input.projectId,
      title: input.title,
      description: input.description || null,
      branch: input.branch || null,
      notes: input.notes || null,
      status: "ACTIVE",
    },
  });
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  return prisma.task.update({
    where: { id },
    data: {
      status,
      closedAt: status === "COMPLETED" ? new Date() : null,
    },
  });
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
