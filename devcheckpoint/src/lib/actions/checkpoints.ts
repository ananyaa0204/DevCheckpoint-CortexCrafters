"use server";

import { prisma } from "@/lib/db/prisma";
import { getGitContext } from "@/lib/git/git-client";
import { buildContextSnapshot } from "@/lib/context/snapshot";
import { sanitizeCheckpointContext } from "@/lib/security/sanitizer";
import { generateCheckpointSummary } from "@/lib/ai/checkpoint-generator";
import { getSettings } from "@/lib/actions/settings";
import type { CommitInfo } from "@/lib/git/types";

const MAX_NOTE_CHARS = 5000;

export async function saveCheckpoint(input: { taskId: string; developerNote: string }) {
  const task = await prisma.task.findUnique({
    where: { id: input.taskId },
    include: { project: true },
  });
  if (!task) throw new Error("Task not found.");

  const git = await getGitContext(task.project.repoRoot);
  const developerNote = input.developerNote.slice(0, MAX_NOTE_CHARS) || null;

  // Sanitize BEFORE anything is persisted or sent to Ollama — never
  // store or transmit the raw values.
  const sanitized = sanitizeCheckpointContext({
    diff: git.diff,
    files: git.files,
    developerNote,
    commits: git.commits,
  });

  const snapshot = buildContextSnapshot({
    taskTitle: task.title,
    taskDescription: task.description,
    branch: git.branch,
    developerNote: sanitized.developerNote,
    files: sanitized.files,
    commits: sanitized.commits,
    diffTruncated: git.diffTruncated,
  });

  const settings = await getSettings();
  const generation = await generateCheckpointSummary({
    endpoint: settings.ollama_endpoint,
    model: settings.ollama_model,
    context: {
      taskTitle: task.title,
      taskDescription: task.description,
      branch: git.branch,
      files: sanitized.files.map((f) => ({ path: f.path, changeType: f.changeType })),
      diff: sanitized.diff,
      commits: sanitized.commits,
      developerNote: sanitized.developerNote,
    },
  });

  const checkpoint = await prisma.checkpoint.create({
    data: {
      taskId: task.id,
      branch: git.branch,
      gitStatusSummary: git.isClean
        ? "Clean"
        : `${sanitized.files.length} file${sanitized.files.length === 1 ? "" : "s"} changed`,
      diffText: sanitized.diff,
      commitsJson: JSON.stringify(sanitized.commits),
      developerNote: sanitized.developerNote,
      contextSnapshotJson: JSON.stringify(snapshot),
      aiSummaryJson: generation.status === "COMPLETED" ? JSON.stringify(generation.data) : null,
      generationStatus: generation.status,
      generationError: generation.status !== "COMPLETED" ? generation.reason : null,
      files: {
        create: sanitized.files.map((f) => ({
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

/**
 * Re-runs AI generation for an existing checkpoint using its already-
 * sanitized, already-stored context (never re-reads the repository, and
 * never re-sanitizes since the stored values are already redacted).
 */
export async function regenerateCheckpointSummary(checkpointId: string) {
  const checkpoint = await prisma.checkpoint.findUnique({
    where: { id: checkpointId },
    include: { files: true, task: true },
  });
  if (!checkpoint) throw new Error("Checkpoint not found.");

  const settings = await getSettings();
  const commits: CommitInfo[] = checkpoint.commitsJson ? JSON.parse(checkpoint.commitsJson) : [];

  const generation = await generateCheckpointSummary({
    endpoint: settings.ollama_endpoint,
    model: settings.ollama_model,
    context: {
      taskTitle: checkpoint.task.title,
      taskDescription: checkpoint.task.description,
      branch: checkpoint.branch,
      files: checkpoint.files.map((f) => ({ path: f.filePath, changeType: f.changeType })),
      diff: checkpoint.diffText ?? "",
      commits,
      developerNote: checkpoint.developerNote,
    },
  });

  return prisma.checkpoint.update({
    where: { id: checkpointId },
    data: {
      aiSummaryJson: generation.status === "COMPLETED" ? JSON.stringify(generation.data) : null,
      generationStatus: generation.status,
      generationError: generation.status !== "COMPLETED" ? generation.reason : null,
    },
    include: { files: true },
  });
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
