import path from "node:path";
import chokidar, { type FSWatcher } from "chokidar";
import { isExcludedPath } from "@/lib/security/patterns";

/**
 * Lightweight, per-project file-activity tracking. Watches ONLY the
 * project's own repository root (never the wider filesystem), ignores
 * sensitive/noise paths using the same rules as the Git context pipeline,
 * and keeps only a small in-memory ring buffer of recent events — never
 * file contents. See AGENT_RULES.md §15.
 */

export type FileActivityEvent = {
  path: string;
  changeType: "created" | "modified" | "deleted";
  timestamp: string;
};

type WatcherEntry = {
  watcher: FSWatcher;
  events: FileActivityEvent[];
};

const MAX_EVENTS = 50;

// Survive Next.js dev-mode module reloads (same pattern as db/prisma.ts).
const globalForWatchers = globalThis as unknown as {
  __devcheckpointWatchers?: Map<string, WatcherEntry>;
};
const watchers = globalForWatchers.__devcheckpointWatchers ?? new Map<string, WatcherEntry>();
globalForWatchers.__devcheckpointWatchers = watchers;

function recordEvent(
  entry: WatcherEntry,
  relPath: string,
  changeType: FileActivityEvent["changeType"]
): void {
  entry.events.unshift({ path: relPath, changeType, timestamp: new Date().toISOString() });
  if (entry.events.length > MAX_EVENTS) entry.events.length = MAX_EVENTS;
}

export function startWatching(projectId: string, repoRoot: string): void {
  if (watchers.has(projectId)) return;

  const watcher = chokidar.watch(repoRoot, {
    ignoreInitial: true,
    ignored: (watchedPath: string) => {
      const rel = path.relative(repoRoot, watchedPath);
      if (!rel || rel.startsWith("..")) return false;
      return isExcludedPath(rel);
    },
    depth: 12,
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
  });

  const entry: WatcherEntry = { watcher, events: [] };
  watchers.set(projectId, entry);

  watcher.on("add", (p) => recordEvent(entry, path.relative(repoRoot, p), "created"));
  watcher.on("change", (p) => recordEvent(entry, path.relative(repoRoot, p), "modified"));
  watcher.on("unlink", (p) => recordEvent(entry, path.relative(repoRoot, p), "deleted"));
  watcher.on("error", () => stopWatching(projectId));
}

export async function stopWatching(projectId: string): Promise<void> {
  const entry = watchers.get(projectId);
  if (!entry) return;
  watchers.delete(projectId);
  await entry.watcher.close().catch(() => undefined);
}

export function getRecentFileActivity(projectId: string): FileActivityEvent[] {
  return watchers.get(projectId)?.events ?? [];
}

export function isWatchingProject(projectId: string): boolean {
  return watchers.has(projectId);
}
