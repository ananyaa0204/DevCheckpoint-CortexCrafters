"use server";

import { prisma } from "@/lib/db/prisma";
import { validateRepository } from "@/lib/git/git-client";
import type { RepositoryValidation } from "@/lib/git/types";

export async function checkRepositoryPath(dirPath: string): Promise<RepositoryValidation> {
  return validateRepository(dirPath);
}

export async function createProject(dirPath: string) {
  const validation = await validateRepository(dirPath);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const existing = await prisma.project.findUnique({
    where: { localPath: validation.repoRoot },
  });
  if (existing) {
    return existing;
  }

  return prisma.project.create({
    data: {
      name: validation.name,
      localPath: validation.repoRoot,
      repoRoot: validation.repoRoot,
      lastOpenedAt: new Date(),
    },
  });
}

export async function listProjects() {
  const projects = await prisma.project.findMany({
    orderBy: [{ lastOpenedAt: "desc" }, { createdAt: "desc" }],
    include: {
      tasks: {
        where: { status: "ACTIVE" },
        select: { id: true },
      },
      _count: { select: { tasks: true } },
    },
  });

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    localPath: p.localPath,
    repoRoot: p.repoRoot,
    createdAt: p.createdAt,
    lastOpenedAt: p.lastOpenedAt,
    activeTaskCount: p.tasks.length,
    taskCount: p._count.tasks,
  }));
}

export async function getProject(id: string) {
  return prisma.project.findUnique({ where: { id } });
}

export async function touchProjectOpened(id: string) {
  await prisma.project.update({
    where: { id },
    data: { lastOpenedAt: new Date() },
  });
}

export async function countActiveProjects() {
  return prisma.project.count();
}
