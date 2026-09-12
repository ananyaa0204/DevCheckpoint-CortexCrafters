"use server";

import { prisma } from "@/lib/db/prisma";
import { getGitContext, getFileDiff } from "@/lib/git/git-client";
import type { GitContext } from "@/lib/git/types";

export async function getProjectGitContext(projectId: string): Promise<GitContext | null> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return null;
  return getGitContext(project.repoRoot);
}

export async function getProjectCurrentBranch(projectId: string): Promise<string | null> {
  const context = await getProjectGitContext(projectId);
  return context?.branch ?? null;
}

export async function getProjectFileDiff(projectId: string, filePath: string): Promise<string> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return "";
  return getFileDiff(project.repoRoot, filePath);
}
