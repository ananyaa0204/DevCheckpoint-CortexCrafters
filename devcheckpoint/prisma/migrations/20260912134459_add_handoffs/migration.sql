-- CreateTable
CREATE TABLE "handoffs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checkpoint_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "handoffs_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_id") REFERENCES "checkpoints" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "handoffs_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "handoffs_task_id_created_at_idx" ON "handoffs"("task_id", "created_at");
