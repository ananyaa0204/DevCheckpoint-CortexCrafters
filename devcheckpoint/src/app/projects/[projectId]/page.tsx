import { notFound } from "next/navigation";
import { FolderGit2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { BackButton } from "@/components/layout/back-button";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/shared/error-state";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { getProject, touchProjectOpened } from "@/lib/actions/projects";
import { listTasksForProject } from "@/lib/actions/tasks";
import { getGitContext } from "@/lib/git/git-client";

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) notFound();

  await touchProjectOpened(project.id);
  const tasks = await listTasksForProject(project.id);

  let gitError: string | null = null;
  let git = null;
  try {
    git = await getGitContext(project.repoRoot);
  } catch (err) {
    gitError = err instanceof Error ? err.message : "Could not read repository state.";
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-2">
        <BackButton href="/projects" label="Back to Projects" />
        <div className="flex items-center gap-3">
          <FolderGit2 className="size-6 text-primary" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">{project.name}</h1>
              <Badge variant="outline" className="border-success/20 bg-success/15 text-success">
                Local
              </Badge>
            </div>
            <p className="truncate font-mono text-xs text-text-muted">{project.localPath}</p>
          </div>
        </div>
      </div>

      {gitError ? (
        <ErrorState title="Repository path is unavailable" message={gitError} />
      ) : git ? (
        <ProjectWorkspace projectId={project.id} git={git} tasks={tasks} />
      ) : null}
    </AppShell>
  );
}
