"use client";

import { useEffect, useState } from "react";
import { Activity, FilePlus, FilePen, FileMinus } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { getFileActivity } from "@/lib/actions/activity";
import type { FileActivityEvent } from "@/lib/watch/repo-watcher";

const ICONS = {
  created: FilePlus,
  modified: FilePen,
  deleted: FileMinus,
} as const;

export function FileActivityPanel({ projectId }: { projectId: string }) {
  const [watching, setWatching] = useState(false);
  const [events, setEvents] = useState<FileActivityEvent[]>([]);

  useEffect(() => {
    let cancelled = false;

    function poll() {
      getFileActivity(projectId).then((result) => {
        if (cancelled) return;
        setWatching(result.watching);
        setEvents(result.events);
      });
    }

    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [projectId]);

  if (!watching) {
    return (
      <div className="rounded-lg border border-border bg-surface-1 p-4">
        <div className="mb-1 flex items-center gap-1.5">
          <Activity className="size-4 text-text-muted" />
          <h3 className="text-sm font-semibold">Recent File Activity</h3>
        </div>
        <p className="text-xs text-text-muted">
          Not tracking — file activity is only watched while this project has an active task.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface-1 p-4">
      <div className="mb-2 flex items-center gap-1.5">
        <Activity className="size-4 text-success" />
        <h3 className="text-sm font-semibold">Recent File Activity</h3>
      </div>
      {events.length === 0 ? (
        <p className="text-xs text-text-muted">Watching for changes — nothing detected yet.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {events.slice(0, 10).map((e, i) => {
            const Icon = ICONS[e.changeType];
            return (
              <div key={`${e.path}-${e.timestamp}-${i}`} className="flex items-center gap-2 text-xs">
                <Icon className="size-3.5 shrink-0 text-text-muted" />
                <span className="min-w-0 flex-1 truncate font-mono text-text-secondary">{e.path}</span>
                <span className="shrink-0 text-text-muted">{formatRelativeTime(e.timestamp)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
