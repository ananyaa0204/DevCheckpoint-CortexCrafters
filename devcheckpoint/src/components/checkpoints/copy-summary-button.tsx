"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { CheckpointAiOutput } from "@/lib/ai/checkpoint-schema";

/**
 * Copies a plain-text summary: the AI summary fields when one completed
 * successfully, otherwise the raw captured checkpoint info (developer
 * note + changed files) — a summary is always available to copy.
 */
export function CopySummaryButton({
  taskTitle,
  branch,
  developerNote,
  changedFiles,
  summary,
}: {
  taskTitle: string;
  branch: string | null;
  developerNote: string | null;
  changedFiles: string[];
  summary: CheckpointAiOutput | null;
}) {
  function buildText(): string {
    const changes = summary && summary.changes.length > 0 ? summary.changes : changedFiles;
    const files = summary && summary.importantFiles.length > 0 ? summary.importantFiles : changedFiles;

    const lines = [
      `Task: ${taskTitle}`,
      `Branch: ${branch ?? "unknown"}`,
      "",
      "Changes:",
      changes.length > 0 ? changes.map((c) => `- ${c}`).join("\n") : "- (none captured)",
      "",
      `Blocker: ${summary?.blocker || developerNote || "None recorded"}`,
      "",
      "Attempts:",
      summary && summary.attempts.length > 0
        ? summary.attempts.map((a) => `- ${a}`).join("\n")
        : "- Not tracked for this checkpoint",
      "",
      "Important Files:",
      files.length > 0 ? files.map((f) => `- ${f}`).join("\n") : "- (none captured)",
      "",
      `Next Step: ${summary?.nextStep || "Not available"}`,
    ];
    return lines.join("\n");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildText());
      toast.success("Summary copied to clipboard");
    } catch {
      toast.error("Could not copy summary.");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      <Copy /> Copy Summary
    </Button>
  );
}
