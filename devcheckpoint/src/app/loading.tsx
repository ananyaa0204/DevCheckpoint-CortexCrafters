import { AppShell } from "@/components/layout/app-shell";
import { LoadingState } from "@/components/shared/loading-state";

export default function Loading() {
  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <LoadingState rows={2} />
        <LoadingState rows={4} />
      </div>
    </AppShell>
  );
}
