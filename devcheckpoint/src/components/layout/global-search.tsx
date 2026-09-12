"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FolderGit2, ListTodo, BookmarkCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { globalSearch, type SearchResult } from "@/lib/actions/search";

const ICONS = {
  project: FolderGit2,
  task: ListTodo,
  checkpoint: BookmarkCheck,
} as const;

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    const timer = setTimeout(() => {
      if (trimmed.length < 2) {
        setResults([]);
        return;
      }
      globalSearch(trimmed).then((r) => {
        setResults(r);
        setOpen(true);
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(result: SearchResult) {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  }

  return (
    <div ref={containerRef} className="relative max-w-md flex-1">
      <div className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text-muted">
        <Search className="size-4 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search projects, tasks, checkpoints..."
          className="flex-1 truncate bg-transparent text-foreground outline-none placeholder:text-text-muted"
        />
        <Badge variant="secondary" className="shrink-0 font-mono text-[11px]">
          Ctrl K
        </Badge>
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-md border border-border bg-surface-1 shadow-lg">
          {results.map((r) => {
            const Icon = ICONS[r.type];
            return (
              <button
                key={`${r.type}-${r.id}`}
                type="button"
                onClick={() => handleSelect(r)}
                className="flex w-full items-center gap-2.5 border-b border-border-subtle px-3 py-2.5 text-left last:border-b-0 hover:bg-surface-2"
              >
                <Icon className="size-4 shrink-0 text-text-muted" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{r.title}</p>
                  <p className="truncate text-xs text-text-muted">{r.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
