import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

/**
 * Applies pending Prisma migrations directly against the resolved app-data
 * SQLite file. `prisma migrate dev` only ever touches the CLI's local
 * `prisma/dev.db` (via .env); the real per-OS app-data database created by
 * getDatabaseUrl() needs the same schema applied at runtime, since there is
 * no server to run `prisma migrate deploy` against for a desktop app.
 *
 * This reads migrations from the source tree (process.cwd()), which is
 * correct for `pnpm dev` / `pnpm tauri dev`. Packaging migrations into a
 * production Tauri bundle is a Phase 10 (installer/build) concern, not part
 * of this milestone.
 */
export function applyPendingMigrations(dbFile: string): void {
  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  if (!fs.existsSync(migrationsDir)) return;

  const db = new Database(dbFile);
  try {
    db.exec(
      `CREATE TABLE IF NOT EXISTS _devcheckpoint_migrations (
         name TEXT PRIMARY KEY,
         applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`
    );

    const applied = new Set(
      db
        .prepare(`SELECT name FROM _devcheckpoint_migrations`)
        .all()
        .map((row) => (row as { name: string }).name)
    );

    const migrationDirs = fs
      .readdirSync(migrationsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const name of migrationDirs) {
      if (applied.has(name)) continue;
      const sqlPath = path.join(migrationsDir, name, "migration.sql");
      if (!fs.existsSync(sqlPath)) continue;

      const sql = fs.readFileSync(sqlPath, "utf-8");
      db.exec(sql);
      db.prepare(`INSERT INTO _devcheckpoint_migrations (name) VALUES (?)`).run(name);
    }
  } finally {
    db.close();
  }
}
