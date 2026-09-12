"use server";

import { prisma } from "@/lib/db/prisma";
import { redactSecrets } from "@/lib/security/sanitizer";

const MAX_ENTRY_CHARS = 4000;

export async function addCommandLog(input: { taskId: string; command: string; exitStatus?: number }) {
  const { text } = redactSecrets(input.command.trim().slice(0, MAX_ENTRY_CHARS));
  return prisma.commandLog.create({
    data: {
      taskId: input.taskId,
      command: text,
      exitStatus: input.exitStatus ?? null,
    },
  });
}

export async function addErrorLog(input: { taskId: string; message: string; source?: string }) {
  const { text } = redactSecrets(input.message.trim().slice(0, MAX_ENTRY_CHARS));
  return prisma.errorLog.create({
    data: {
      taskId: input.taskId,
      message: text,
      source: input.source?.trim() || null,
    },
  });
}

export async function listCommandLogs(taskId: string) {
  return prisma.commandLog.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function listErrorLogs(taskId: string) {
  return prisma.errorLog.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function deleteCommandLog(id: string) {
  await prisma.commandLog.delete({ where: { id } });
}

export async function deleteErrorLog(id: string) {
  await prisma.errorLog.delete({ where: { id } });
}
