import type { ReactNode } from "react";
import { BackButton } from "@/components/layout/back-button";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/layout/breadcrumbs";

/**
 * Consistent hierarchy for nested/detail pages:
 * [Back]
 * Breadcrumbs (optional)
 * Title + description
 * Contextual actions
 */
export function DetailHeader({
  backHref,
  backLabel,
  breadcrumbs,
  title,
  description,
  actions,
}: {
  backHref: string;
  backLabel: string;
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <BackButton href={backHref} label={backLabel} />
        {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-foreground">{title}</h1>
          {description ? <div className="mt-0.5 text-xs text-text-muted">{description}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
