"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex flex-col gap-0.5 px-4 py-5">
        <div className="flex items-center gap-2 text-sidebar-foreground">
          <BookmarkCheck className="size-5 text-primary" />
          <span className="text-[15px] font-semibold">DevCheckpoint</span>
        </div>
        <span className="text-xs text-text-muted">Context. Saved.</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-2.5 rounded-md px-3 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-3 rounded-lg border border-sidebar-border bg-surface-2 p-3 text-xs text-text-secondary">
        Local-first. Your code and checkpoints never leave this machine.
      </div>

      <div className="flex items-center gap-2.5 border-t border-sidebar-border px-4 py-3.5">
        <div className="flex size-8 items-center justify-center rounded-full bg-surface-3 text-xs font-medium text-text-secondary">
          DC
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm text-sidebar-foreground">Local Developer</span>
          <span className="truncate text-xs text-text-muted">Not signed in</span>
        </div>
      </div>
    </aside>
  );
}
