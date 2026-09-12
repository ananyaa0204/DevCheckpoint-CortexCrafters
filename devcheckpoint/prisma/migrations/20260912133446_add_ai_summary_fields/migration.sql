-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_checkpoints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "branch" TEXT,
    "git_status_summary" TEXT,
    "diff_text" TEXT,
    "commits_json" TEXT,
    "developer_note" TEXT,
    "context_snapshot_json" TEXT NOT NULL,
    "ai_summary_json" TEXT,
    "generation_status" TEXT NOT NULL DEFAULT 'SKIPPED',
    "generation_error" TEXT,
    CONSTRAINT "checkpoints_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_checkpoints" ("branch", "commits_json", "context_snapshot_json", "created_at", "developer_note", "diff_text", "generation_status", "git_status_summary", "id", "task_id") SELECT "branch", "commits_json", "context_snapshot_json", "created_at", "developer_note", "diff_text", "generation_status", "git_status_summary", "id", "task_id" FROM "checkpoints";
DROP TABLE "checkpoints";
ALTER TABLE "new_checkpoints" RENAME TO "checkpoints";
CREATE INDEX "checkpoints_task_id_created_at_idx" ON "checkpoints"("task_id", "created_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
