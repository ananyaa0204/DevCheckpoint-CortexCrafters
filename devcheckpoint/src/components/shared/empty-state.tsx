export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-start gap-1.5 rounded-lg border border-dashed border-border bg-surface-1 p-6">
      <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
      <p className="max-w-md text-sm text-text-secondary">{description}</p>
    </div>
  );
}
