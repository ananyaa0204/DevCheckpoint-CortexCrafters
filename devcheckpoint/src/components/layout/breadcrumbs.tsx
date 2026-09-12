import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex min-w-0 items-center gap-1.5 text-xs text-text-muted" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex min-w-0 items-center gap-1.5">
          {i > 0 && <ChevronRight className="size-3 shrink-0" />}
          {item.href ? (
            <Link href={item.href} className="truncate hover:text-foreground hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="truncate text-text-secondary">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
