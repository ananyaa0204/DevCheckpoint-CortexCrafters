"use server";

import { getCheckpoint } from "@/lib/actions/checkpoints";

export async function buildHandoff(checkpointId: string) {
  const checkpoint = await getCheckpoint(checkpointId);
  if (!checkpoint) throw new Error("Checkpoint not found.");

  const commits: { hash: string; message: string }[] = checkpoint.commitsJson
    ? JSON.parse(checkpoint.commitsJson)
    : [];

  const lines: string[] = [];
  lines.push(`# Handoff: ${checkpoint.task.title}`);
  lines.push("");
  lines.push(`**Project:** ${checkpoint.task.project.name}`);
  lines.push(`**Branch:** ${checkpoint.branch ?? "unknown"}`);
  lines.push(`**Checkpoint saved:** ${checkpoint.createdAt.toISOString()}`);
  lines.push("");

  if (checkpoint.task.description) {
    lines.push("## Task");
    lines.push(checkpoint.task.description);
    lines.push("");
  }

  if (checkpoint.developerNote) {
    lines.push("## Developer Note");
    lines.push(checkpoint.developerNote);
    lines.push("");
  }

  lines.push(`## Changed Files (${checkpoint.files.length})`);
  if (checkpoint.files.length === 0) {
    lines.push("_No changed files were captured._");
  } else {
    for (const f of checkpoint.files) {
      lines.push(`- \`${f.filePath}\` (${f.changeType})`);
    }
  }
  lines.push("");

  if (commits.length > 0) {
    lines.push("## Recent Commits");
    for (const c of commits) {
      lines.push(`- \`${c.hash}\` ${c.message}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push(
    "_This handoff was generated deterministically from saved checkpoint data. No AI summary is included yet._"
  );

  const markdown = lines.join("\n");
  return {
    markdown,
    checkpoint,
  };
}
