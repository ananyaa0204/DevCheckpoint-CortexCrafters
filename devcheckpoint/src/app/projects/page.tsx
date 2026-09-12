import Link from "next/link";
import { FolderGit2, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import { formatRelativeTime } from "@/lib/utils";
import { listProjects } from "@/lib/actions/projects";

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <AppShell>
      <div className="mb-6 flex items-start justify-between">
        <PageHeader title="Projects" description="Local Git repositories registered with DevCheckpoint." />
        <AddProjectDialog trigger={<Button>Add Project</Button>} />
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Add a local Git repository to start saving development context."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="flex flex-col gap-2 rounded-lg border border-border bg-surface-1 p-4 transition-colors hover:bg-surface-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="size-4 text-primary" />
                  <span className="font-medium text-foreground">{p.name}</span>
                </div>
                <ArrowRight className="size-4 text-text-muted" />
              </div>
              <p className="truncate font-mono text-xs text-text-muted">{p.localPath}</p>
              <div className="mt-1 flex items-center gap-2">
                {p.activeTaskCount > 0 && (
                  <Badge variant="outline" className="border-success/20 bg-success/15 text-success">
                    {p.activeTaskCount} active task{p.activeTaskCount === 1 ? "" : "s"}
                  </Badge>
                )}
                <span className="text-xs text-text-muted">
                  {p.lastOpenedAt ? `Opened ${formatRelativeTime(p.lastOpenedAt)}` : "Never opened"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
