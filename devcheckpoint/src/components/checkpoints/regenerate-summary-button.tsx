"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { regenerateCheckpointSummary } from "@/lib/actions/checkpoints";

export function RegenerateSummaryButton({ checkpointId }: { checkpointId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await regenerateCheckpointSummary(checkpointId);
      if (result.generationStatus === "COMPLETED") {
        toast.success("AI summary generated");
      } else if (result.generationStatus === "SKIPPED") {
        toast.warning(result.generationError ?? "AI summary skipped.");
      } else {
        toast.error(result.generationError ?? "AI summary generation failed.");
      }
      router.refresh();
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
      {isPending ? "Generating…" : "Generate Summary"}
    </Button>
  );
}
