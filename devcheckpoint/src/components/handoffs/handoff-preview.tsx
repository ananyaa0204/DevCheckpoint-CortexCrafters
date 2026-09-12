"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { saveHandoff } from "@/lib/actions/handoff";

function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^-\s+/gm, "• ");
}

export function HandoffPreview({
  markdown,
  checkpointId,
}: {
  markdown: string;
  checkpointId?: string;
}) {
  const router = useRouter();
  const [isSaving, startSaving] = useTransition();

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }

  function handleSave() {
    if (!checkpointId) return;
    startSaving(async () => {
      try {
        const handoff = await saveHandoff(checkpointId);
        toast.success("Handoff saved");
        router.push(`/handoffs/${handoff.id}`);
        router.refresh();
      } catch {
        toast.error("Could not save handoff.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => copy(markdownToPlainText(markdown), "Handoff")}>
          <Copy /> Copy Handoff
        </Button>
        <Button variant="outline" size="sm" onClick={() => copy(markdown, "Markdown")}>
          <Copy /> Copy Markdown
        </Button>
        {checkpointId && (
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            Save Handoff
          </Button>
        )}
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-surface-1 p-4 font-mono text-xs text-text-secondary">
        {markdown}
      </pre>
    </div>
  );
}
