import { Bell } from "lucide-react";
import { GlobalSearch } from "@/components/layout/global-search";

export function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border px-6">
      <GlobalSearch />

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="flex size-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <Bell className="size-[18px]" />
        </button>
        <div className="flex size-9 items-center justify-center rounded-full bg-surface-3 text-xs font-medium text-text-secondary">
          DC
        </div>
      </div>
    </header>
  );
}
