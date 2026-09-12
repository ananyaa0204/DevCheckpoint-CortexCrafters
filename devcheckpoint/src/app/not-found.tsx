import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AppShell } from "@/components/layout/app-shell";

export default function NotFound() {
  return (
    <AppShell>
      <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border bg-surface-1 p-6">
        <FileQuestion className="size-6 text-text-muted" />
        <h1 className="text-base font-semibold text-foreground">Not found</h1>
        <p className="max-w-md text-sm text-text-secondary">
          This project, task, checkpoint, or handoff doesn&apos;t exist — it may have been removed.
        </p>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back to Dashboard
        </Link>
      </div>
    </AppShell>
  );
}
