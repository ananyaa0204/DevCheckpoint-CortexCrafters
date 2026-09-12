import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { StartTaskForm } from "@/components/tasks/start-task-form";
import { listProjects } from "@/lib/actions/projects";

export default async function StartTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { projectId } = await searchParams;
  const projects = await listProjects();

  return (
    <AppShell>
      <PageHeader
        title="Start a New Task"
        description="Define what you're working on so checkpoints have real context to capture."
      />
      <div className="max-w-2xl">
        <StartTaskForm
          projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          defaultProjectId={projectId}
        />
      </div>
    </AppShell>
  );
}
