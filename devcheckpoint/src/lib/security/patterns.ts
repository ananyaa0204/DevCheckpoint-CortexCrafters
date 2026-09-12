/**
 * Files that must never be read/included in AI or checkpoint context, even
 * if they show up in `git status`. Matched against a path relative to the
 * repository root, using forward slashes.
 *
 * See ARCHITECTURE.md §11, AGENT_RULES.md §4, SECURITY.md.
 */
export const SENSITIVE_PATH_PATTERNS: RegExp[] = [
  /(^|\/)\.env(\..*)?$/i,
  /\.pem$/i,
  /\.key$/i,
  /(^|\/)id_rsa(\.pub)?$/i,
  /(^|\/)id_ed25519(\.pub)?$/i,
  /(^|\/)credentials\.json$/i,
  /(^|\/)secrets\..*$/i,
  /(^|\/)\.ssh(\/|$)/i,
  /(^|\/)\.aws(\/|$)/i,
  /(^|\/)\.gnupg(\/|$)/i,
];

/** Development noise directories to ignore by default (AGENT_RULES.md §5). */
export const IGNORED_DIRECTORY_SEGMENTS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  "vendor",
  ".cache",
  "out",
  "target",
]);

function toPosixPath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

export function isSensitivePath(filePath: string): boolean {
  const normalized = toPosixPath(filePath);
  return SENSITIVE_PATH_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function isIgnoredNoisePath(filePath: string): boolean {
  const segments = toPosixPath(filePath).split("/");
  return segments.some((segment) => IGNORED_DIRECTORY_SEGMENTS.has(segment));
}

/** True if this path should never appear in captured context at all. */
export function isExcludedPath(filePath: string): boolean {
  return isSensitivePath(filePath) || isIgnoredNoisePath(filePath);
}

/**
 * Git pathspec excludes for the sensitive-file patterns and noise
 * directories above. Passed to `git diff`/`git diff --numstat` so their
 * contents are never even read off disk by Git, not just filtered after
 * the fact. Requires Git 2.13+ (pathspec exclude magic).
 */
export const GIT_EXCLUDE_PATHSPECS: string[] = [
  ":(exclude,glob)**/.env",
  ":(exclude,glob)**/.env.*",
  ":(exclude,glob)**/*.pem",
  ":(exclude,glob)**/*.key",
  ":(exclude,glob)**/id_rsa",
  ":(exclude,glob)**/id_rsa.pub",
  ":(exclude,glob)**/id_ed25519",
  ":(exclude,glob)**/id_ed25519.pub",
  ":(exclude,glob)**/credentials.json",
  ":(exclude,glob)**/secrets.*",
  ":(exclude,glob)**/.ssh/**",
  ":(exclude,glob)**/.aws/**",
  ":(exclude,glob)**/.gnupg/**",
  ...[...IGNORED_DIRECTORY_SEGMENTS].map((dir) => `:(exclude,glob)**/${dir}/**`),
];
