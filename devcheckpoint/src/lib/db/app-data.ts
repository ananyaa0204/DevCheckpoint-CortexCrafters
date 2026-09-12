import fs from "node:fs";
import path from "node:path";
import envPaths from "env-paths";

/**
 * Resolves the OS-specific application data directory for DevCheckpoint
 * (e.g. %LOCALAPPDATA%\devcheckpoint on Windows, ~/Library/Application
 * Support/devcheckpoint on macOS) without hardcoding any platform path.
 * Creates the directory if it does not exist yet.
 */
export function getAppDataDir(): string {
  const paths = envPaths("devcheckpoint", { suffix: "" });
  fs.mkdirSync(paths.data, { recursive: true });
  return paths.data;
}

export function getDatabaseFile(): string {
  return path.join(getAppDataDir(), "devcheckpoint.db");
}

export function getDatabaseUrl(): string {
  return `file:${getDatabaseFile()}`;
}
