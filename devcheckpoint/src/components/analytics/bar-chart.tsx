import type { ChartPoint } from "@/lib/analytics/types";

function shouldShowLabel(index: number, total: number): boolean {
  if (total <= 10) return true;
  const step = Math.ceil(total / 6);
  return index % step === 0 || index === total - 1;
}

/**
 * Minimal dependency-free bar chart. Guards against zero data (flat empty
 * bars, no NaN heights), a single datapoint, and long label lists (only a
 * subset of labels render to avoid crowding).
 */
export function BarChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex h-36 min-w-full items-end gap-1">
        {data.map((point, i) => (
          <div
            key={`${point.label}-${i}`}
            className="flex h-full min-w-[4px] flex-1 flex-col justify-end items-center gap-1"
            title={`${point.label}: ${point.count}`}
          >
            <div
              className="w-full rounded-t-sm bg-primary/70 transition-[height]"
              style={{ height: `${Math.max(2, (point.count / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex min-w-full gap-1">
        {data.map((point, i) => (
          <div key={`${point.label}-label-${i}`} className="min-w-[4px] flex-1 text-center">
            {shouldShowLabel(i, data.length) && (
              <span className="text-[10px] text-text-muted">{point.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
