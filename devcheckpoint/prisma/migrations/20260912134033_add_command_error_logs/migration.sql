-- CreateTable
CREATE TABLE "command_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task_id" TEXT NOT NULL,
    "checkpoint_id" TEXT,
    "command" TEXT NOT NULL,
    "exit_status" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "command_logs_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "command_logs_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_id") REFERENCES "checkpoints" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "error_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task_id" TEXT NOT NULL,
    "checkpoint_id" TEXT,
    "message" TEXT NOT NULL,
    "source" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "error_logs_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "error_logs_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_id") REFERENCES "checkpoints" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "command_logs_task_id_created_at_idx" ON "command_logs"("task_id", "created_at");

-- CreateIndex
CREATE INDEX "error_logs_task_id_created_at_idx" ON "error_logs"("task_id", "created_at");
