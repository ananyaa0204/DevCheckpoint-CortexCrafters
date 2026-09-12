"use server";

import { prisma } from "@/lib/db/prisma";
import { getGitContext } from "@/lib/git/git-client";
import { buildContextSnapshot } from "@/lib/context/snapshot";

export async function saveCheckpoint(input: { taskId: string; developerNote: string }) {
  const task = await prisma.task.findUnique({
    where: { id: input.taskId },
    include: { project: true },
  });
  if (!task) throw new Error("Task not found.");

  const git = await getGitContext(task.project.repoRoot);

  const snapshot = buildContextSnapshot({
    taskTitle: task.title,
    taskDescription: task.description,
    branch: git.branch,
    developerNote: input.developerNote || null,
    files: git.files,
    commits: git.commits,
    diffTruncated: git.diffTruncated,
  });

  const checkpoint = await prisma.checkpoint.create({
    data: {
      taskId: task.id,
      branch: git.branch,
      gitStatusSummary: git.isClean
        ? "Clean"
        : `${git.files.length} file${git.files.length === 1 ? "" : "s"} changed`,
      diffText: git.diff,
      commitsJson: JSON.stringify(git.commits),
      developerNote: input.developerNote || null,
      contextSnapshotJson: JSON.stringify(snapshot),
      generationStatus: "raw_only",
      files: {
        create: git.files.map((f) => ({
          filePath: f.path,
          changeType: f.changeType,
        })),
      },
    },
    include: { files: true },
  });

  await prisma.task.update({
    where: { id: task.id },
    data: { updatedAt: new Date() },
  });

  return checkpoint;
}

export async function getLatestCheckpointForTask(taskId: string) {
  return prisma.checkpoint.findFirst({
    where: { taskId },
    orderBy: { createdAt: "desc" },
    include: { files: true, task: { include: { project: true } } },
  });
}

export async function listCheckpointsForTask(taskId: string) {
  return prisma.checkpoint.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
    include: { files: true },
  });
}

export async function listAllCheckpoints() {
  return prisma.checkpoint.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { files: true, task: { include: { project: true } } },
  });
}

export async function getCheckpoint(id: string) {
  return prisma.checkpoint.findUnique({
    where: { id },
    include: { files: true, task: { include: { project: true } } },
  });
}

export async function countCheckpoints() {
  return prisma.checkpoint.count();
}
