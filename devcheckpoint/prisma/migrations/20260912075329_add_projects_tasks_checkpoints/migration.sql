-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "local_path" TEXT NOT NULL,
    "repo_root" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "last_opened_at" DATETIME
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "branch" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "checkpoints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "branch" TEXT,
    "git_status_summary" TEXT,
    "diff_text" TEXT,
    "commits_json" TEXT,
    "developer_note" TEXT,
    "context_snapshot_json" TEXT NOT NULL,
    "generation_status" TEXT NOT NULL DEFAULT 'raw_only',
    CONSTRAINT "checkpoints_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "checkpoint_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checkpoint_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "change_type" TEXT NOT NULL,
    CONSTRAINT "checkpoint_files_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_id") REFERENCES "checkpoints" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_local_path_key" ON "projects"("local_path");

-- CreateIndex
CREATE INDEX "projects_last_opened_at_idx" ON "projects"("last_opened_at");

-- CreateIndex
CREATE INDEX "tasks_project_id_status_idx" ON "tasks"("project_id", "status");

-- CreateIndex
CREATE INDEX "checkpoints_task_id_created_at_idx" ON "checkpoints"("task_id", "created_at");

-- CreateIndex
CREATE INDEX "checkpoint_files_checkpoint_id_idx" ON "checkpoint_files"("checkpoint_id");
