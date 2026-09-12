import { AlertTriangle } from "lucide-react";

export function ErrorState({
  title = "Something went wrong",
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-text-secondary">{message}</p>
      </div>
    </div>
  );
}
