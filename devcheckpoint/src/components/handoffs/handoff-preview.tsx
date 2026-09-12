"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^-\s+/gm, "• ");
}

export function HandoffPreview({ markdown }: { markdown: string }) {
  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => copy(markdownToPlainText(markdown), "Handoff")}>
          <Copy /> Copy Handoff
        </Button>
        <Button variant="outline" size="sm" onClick={() => copy(markdown, "Markdown")}>
          <Copy /> Copy Markdown
        </Button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-surface-1 p-4 font-mono text-xs text-text-secondary">
        {markdown}
      </pre>
    </div>
  );
}
