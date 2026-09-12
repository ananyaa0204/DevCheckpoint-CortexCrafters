export type ChangeType = "modified" | "added" | "deleted" | "renamed" | "untracked";

export type ChangedFileInfo = {
  path: string;
  changeType: ChangeType;
  staged: boolean;
  insertions: number;
  deletions: number;
};

export type CommitInfo = {
  hash: string;
  message: string;
  authorName: string;
  date: string;
};

export type GitContext = {
  branch: string | null;
  files: ChangedFileInfo[];
  filesTruncated: boolean;
  totalFilesChanged: number;
  diff: string;
  diffTruncated: boolean;
  commits: CommitInfo[];
  isClean: boolean;
};

export type RepositoryValidation =
  | { valid: true; repoRoot: string; name: string }
  | { valid: false; reason: string };
