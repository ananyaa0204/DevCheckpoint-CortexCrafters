import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { DetailHeader } from "@/components/layout/detail-header";
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
      <DetailHeader
        backHref={`/tasks/${task.id}`}
        backLabel="Back to Task"
        breadcrumbs={[
          { label: "Tasks", href: "/tasks" },
          { label: task.title, href: `/tasks/${task.id}` },
          { label: "Code Changes" },
        ]}
        title="Code Changes"
        description={`${task.project.name} · ${git?.branch ?? task.branch ?? ""}`}
      />

      {gitError ? (
        <ErrorState title="Repository path is unavailable" message={gitError} />
      ) : git ? (
        <FileDiffExplorer projectId={task.projectId} files={git.files} />
      ) : null}
    </AppShell>
  );
}
