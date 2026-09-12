"use server";

import { prisma } from "@/lib/db/prisma";

export type SearchResult = {
  id: string;
  type: "project" | "task" | "checkpoint";
  title: string;
  subtitle: string;
  href: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const [projects, tasks, checkpoints] = await Promise.all([
    prisma.project.findMany({
      where: { name: { contains: q } },
      take: 5,
    }),
    prisma.task.findMany({
      where: { title: { contains: q } },
      take: 5,
      include: { project: true },
    }),
    prisma.checkpoint.findMany({
      where: { developerNote: { contains: q } },
      take: 5,
      include: { task: { include: { project: true } } },
    }),
  ]);

  return [
    ...projects.map((p) => ({
      id: p.id,
      type: "project" as const,
      title: p.name,
      subtitle: p.localPath,
      href: `/projects/${p.id}`,
    })),
    ...tasks.map((t) => ({
      id: t.id,
      type: "task" as const,
      title: t.title,
      subtitle: t.project.name,
      href: `/tasks/${t.id}`,
    })),
    ...checkpoints.map((c) => ({
      id: c.id,
      type: "checkpoint" as const,
      title: c.task.title,
      subtitle: c.developerNote ?? c.task.project.name,
      href: `/checkpoints/${c.id}`,
    })),
  ];
}
