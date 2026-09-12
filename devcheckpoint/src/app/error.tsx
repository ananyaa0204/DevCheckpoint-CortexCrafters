"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/app-shell";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Local-only logging; never includes secret-bearing payloads by design
    // (see src/lib/security). Safe to log the error message/stack.
    console.error("DevCheckpoint UI error:", error);
  }, [error]);

  return (
    <AppShell>
      <div className="flex flex-col items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-danger" />
          <h1 className="text-base font-semibold text-foreground">Something went wrong</h1>
        </div>
        <p className="max-w-md text-sm text-text-secondary">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
      </div>
    </AppShell>
  );
}
