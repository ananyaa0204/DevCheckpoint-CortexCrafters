export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-1">
      <h1 className="text-[26px] font-bold text-foreground">{title}</h1>
      {description ? (
        <p className="text-sm text-text-secondary">{description}</p>
      ) : null}
    </div>
  );
}
