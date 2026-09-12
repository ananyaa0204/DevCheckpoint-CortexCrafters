import { isExcludedPath } from "@/lib/security/patterns";
import {
  AUTHORIZATION_HEADER_PATTERN,
  BEARER_TOKEN_PATTERN,
  KEY_VALUE_PATTERN,
  PEM_BLOCK_PATTERN,
} from "@/lib/security/secret-patterns";
import type { ChangedFileInfo, CommitInfo } from "@/lib/git/types";

export type RedactionResult = {
  text: string;
  redactionCount: number;
};

/**
 * Redacts likely secrets from free-form text (diffs, notes, commit
 * messages). Runs before anything is persisted or sent to Ollama — never
 * the other way around. Order matters: multi-line PEM blocks and header
 * patterns are handled before the generic KEY=VALUE pass so they aren't
 * partially matched by it first.
 */
export function redactSecrets(text: string | null | undefined): RedactionResult {
  if (!text) return { text: text ?? "", redactionCount: 0 };

  let redactionCount = 0;
  let result = text;

  result = result.replace(PEM_BLOCK_PATTERN, () => {
    redactionCount++;
    return "[REDACTED]";
  });

  result = result.replace(AUTHORIZATION_HEADER_PATTERN, (_match, prefix: string) => {
    redactionCount++;
    return `${prefix}[REDACTED]`;
  });

  result = result.replace(BEARER_TOKEN_PATTERN, () => {
    redactionCount++;
    return "Bearer [REDACTED]";
  });

  result = result.replace(KEY_VALUE_PATTERN, (_match, prefix: string) => {
    redactionCount++;
    return `${prefix}[REDACTED]`;
  });

  return { text: result, redactionCount };
}

/** Drops any changed file whose path is sensitive or known dev noise. */
export function sanitizeChangedFiles<T extends { path: string }>(
  files: T[]
): { files: T[]; excludedPaths: string[] } {
  const kept: T[] = [];
  const excludedPaths: string[] = [];
  for (const f of files) {
    if (isExcludedPath(f.path)) {
      excludedPaths.push(f.path);
    } else {
      kept.push(f);
    }
  }
  return { files: kept, excludedPaths };
}

export type SanitizationSummary = {
  filesExcluded: number;
  excludedFilePaths: string[];
  secretsRedacted: number;
};

export type SanitizedCheckpointContext = {
  diff: string;
  files: ChangedFileInfo[];
  developerNote: string | null;
  commits: CommitInfo[];
  summary: SanitizationSummary;
};

/**
 * The single entry point checkpoint saving (and, later, the Ollama
 * request builder) should call before persisting or transmitting anything.
 * Never store or send the pre-sanitization values.
 */
export function sanitizeCheckpointContext(input: {
  diff: string;
  files: ChangedFileInfo[];
  developerNote: string | null;
  commits: CommitInfo[];
}): SanitizedCheckpointContext {
  const { files: keptFiles, excludedPaths } = sanitizeChangedFiles(input.files);

  const diffResult = redactSecrets(input.diff);
  const noteResult = redactSecrets(input.developerNote);

  let commitRedactions = 0;
  const commits = input.commits.map((c) => {
    const r = redactSecrets(c.message);
    commitRedactions += r.redactionCount;
    return { ...c, message: r.text };
  });

  return {
    diff: diffResult.text,
    files: keptFiles,
    developerNote: input.developerNote === null ? null : noteResult.text,
    commits,
    summary: {
      filesExcluded: excludedPaths.length,
      excludedFilePaths: excludedPaths,
      secretsRedacted: diffResult.redactionCount + noteResult.redactionCount + commitRedactions,
    },
  };
}
