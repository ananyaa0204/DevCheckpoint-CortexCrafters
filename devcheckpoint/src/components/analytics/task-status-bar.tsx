import type { TaskStatusCounts } from "@/lib/analytics/types";

const SEGMENTS: { key: keyof TaskStatusCounts; label: string; barClass: string; dotClass: string }[] = [
  { key: "active", label: "Active", barClass: "bg-success", dotClass: "bg-success" },
  { key: "paused", label: "Paused", barClass: "bg-warning", dotClass: "bg-warning" },
  { key: "completed", label: "Completed", barClass: "bg-neutral", dotClass: "bg-neutral" },
];

export function TaskStatusBar({ status }: { status: TaskStatusCounts }) {
  const total = status.active + status.paused + status.completed;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
        {total === 0 ? (
          <div className="h-full w-full bg-surface-3" />
        ) : (
          SEGMENTS.map((segment) => {
            const value = status[segment.key];
            if (value === 0) return null;
            return (
              <div
                key={segment.key}
                className={segment.barClass}
                style={{ width: `${(value / total) * 100}%` }}
                title={`${segment.label}: ${value}`}
              />
            );
          })
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {SEGMENTS.map((segment) => (
          <div key={segment.key} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-text-secondary">
              <span className={`size-2 rounded-full ${segment.dotClass}`} />
              {segment.label}
            </span>
            <span className="font-medium text-foreground">{status[segment.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
