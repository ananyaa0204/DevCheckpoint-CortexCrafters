import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { FileDiffExplorer } from "@/components/git/file-diff-explorer";
import { getTask } from "@/lib/actions/tasks";
import { getGitContext } from "@/lib/git/git-client";

export default async function TaskCodeChangesPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const task = await getTask(taskId);
  if (!task) notFound();

  let gitError: string | null = null;
  let git = null;
  try {
    git = await getGitContext(task.project.repoRoot);
  } catch (err) {
    gitError = err instanceof Error ? err.message : "Could not read repository state.";
  }

  return (
    <AppShell>
      <p className="mb-1 text-xs text-text-muted">
        <Link href={`/tasks/${task.id}`} className="hover:underline">
          {task.title}
        </Link>{" "}
        / Code Changes
      </p>
      <PageHeader title="Code Changes" description={`${task.project.name} · ${git?.branch ?? task.branch ?? ""}`} />

      {gitError ? (
        <ErrorState title="Repository path is unavailable" message={gitError} />
      ) : git ? (
        <FileDiffExplorer projectId={task.projectId} files={git.files} />
      ) : null}
    </AppShell>
  );
}
