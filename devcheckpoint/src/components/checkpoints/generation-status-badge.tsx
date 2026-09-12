import { Sparkles, XCircle, MinusCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_META: Record<string, { label: string; className: string; icon: typeof Sparkles }> = {
  COMPLETED: { label: "AI Summary", className: "border-purple/20 bg-purple/15 text-purple", icon: Sparkles },
  FAILED: { label: "AI Generation Failed", className: "border-danger/20 bg-danger/15 text-danger", icon: XCircle },
  SKIPPED: { label: "AI Summary Skipped", className: "border-neutral/20 bg-neutral/15 text-text-secondary", icon: MinusCircle },
  PENDING: { label: "Pending", className: "border-neutral/20 bg-neutral/15 text-text-secondary", icon: Loader2 },
  GENERATING: { label: "Generating…", className: "border-info/20 bg-info/15 text-info", icon: Loader2 },
};

export function GenerationStatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.SKIPPED;
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={cn("border gap-1", meta.className)}>
      <Icon className="size-3" />
      {meta.label}
    </Badge>
  );
}
