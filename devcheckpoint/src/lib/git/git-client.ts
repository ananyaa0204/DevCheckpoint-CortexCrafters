import fs from "node:fs";
import path from "node:path";
import { simpleGit } from "simple-git";
import type { ChangedFileInfo, ChangeType, CommitInfo, GitContext, RepositoryValidation } from "./types";

/**
 * All Git access in this module is READ-ONLY (status, diff, log, rev-parse,
 * branch --show-current). Never call commit/push/pull/checkout/reset/merge/
 * rebase/stash/clean here — see AGENT_RULES.md §6 and SECURITY.md.
 */

const MAX_DIFF_CHARS = 20_000;
const MAX_COMMITS = 5;

export async function validateRepository(dirPath: string): Promise<RepositoryValidation> {
  let stat: fs.Stats;
  try {
    stat = await fs.promises.stat(dirPath);
  } catch {
    return { valid: false, reason: "That folder does not exist or is not accessible." };
  }
  if (!stat.isDirectory()) {
    return { valid: false, reason: "Selected path is not a folder." };
  }

  const git = simpleGit(dirPath);
  const isRepo = await git.checkIsRepo().catch(() => false);
  if (!isRepo) {
    return { valid: false, reason: "Selected folder is not a Git repository." };
  }

  const repoRoot = (await git.revparse(["--show-toplevel"])).trim();
  const normalizedRoot = path.normalize(repoRoot);
  const name = path.basename(normalizedRoot);

  return { valid: true, repoRoot: normalizedRoot, name };
}

function mapChangeType(index: string, workingDir: string): ChangeType {
  const code = index !== " " && index !== "?" ? index : workingDir;
  switch (code) {
    case "A":
      return "added";
    case "D":
      return "deleted";
    case "R":
      return "renamed";
    case "?":
      return "untracked";
    case "M":
    default:
      return "modified";
  }
}

export async function getGitContext(repoRoot: string): Promise<GitContext> {
  const git = simpleGit(repoRoot);

  const [status, branchSummary, workingDiff, stagedDiff, log, workingSummary, stagedSummary] =
    await Promise.all([
      git.status(),
      git.branch(),
      git.diff().catch(() => ""),
      git.diff(["--cached"]).catch(() => ""),
      git.log(["-n", String(MAX_COMMITS)]).catch(() => ({ all: [] })),
      git.diffSummary().catch(() => ({ files: [] })),
      git.diffSummary(["--cached"]).catch(() => ({ files: [] })),
    ]);

  const lineStats = new Map<string, { insertions: number; deletions: number }>();
  for (const summary of [workingSummary, stagedSummary]) {
    for (const f of summary.files) {
      if ("insertions" in f && "deletions" in f) {
        const prev = lineStats.get(f.file) ?? { insertions: 0, deletions: 0 };
        lineStats.set(f.file, {
          insertions: prev.insertions + f.insertions,
          deletions: prev.deletions + f.deletions,
        });
      }
    }
  }

  const files: ChangedFileInfo[] = status.files.map((f) => ({
    path: f.path,
    changeType: mapChangeType(f.index, f.working_dir),
    staged: f.index !== " " && f.index !== "?",
    insertions: lineStats.get(f.path)?.insertions ?? 0,
    deletions: lineStats.get(f.path)?.deletions ?? 0,
  }));

  const combinedDiff = [stagedDiff, workingDiff].filter(Boolean).join("\n");
  const diffTruncated = combinedDiff.length > MAX_DIFF_CHARS;
  const diff = diffTruncated ? combinedDiff.slice(0, MAX_DIFF_CHARS) : combinedDiff;

  const commits: CommitInfo[] = log.all.map((c) => ({
    hash: c.hash.slice(0, 7),
    message: c.message,
    authorName: c.author_name,
    date: c.date,
  }));

  return {
    branch: branchSummary.current || status.current || null,
    files,
    diff,
    diffTruncated,
    commits,
    isClean: status.isClean(),
  };
}

export async function getFileDiff(repoRoot: string, filePath: string): Promise<string> {
  const git = simpleGit(repoRoot);
  const [staged, working] = await Promise.all([
    git.diff(["--cached", "--", filePath]).catch(() => ""),
    git.diff(["--", filePath]).catch(() => ""),
  ]);
  const combined = [staged, working].filter(Boolean).join("\n");
  return combined.length > MAX_DIFF_CHARS ? combined.slice(0, MAX_DIFF_CHARS) : combined;
}
