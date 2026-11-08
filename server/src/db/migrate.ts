import { promises as fs } from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { env } from '../env';

const migrationPool = new Pool({
  connectionString: env.DIRECT_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function ensureMigrationsTable(): Promise<void> {
  await migrationPool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function appliedMigrations(): Promise<Set<string>> {
  const res = await migrationPool.query<{ filename: string }>('SELECT filename FROM schema_migrations');
  return new Set(res.rows.map((r) => r.filename));
}

async function listMigrationFiles(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir);
  return files.filter((f) => f.endsWith('.sql')).sort();
}

async function migrate(): Promise<void> {
  await ensureMigrationsTable();
  const applied = await appliedMigrations();
  const dir = path.resolve(__dirname, '../../migrations');
  const files = await listMigrationFiles(dir);
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`[migrate] skip ${file}`);
      continue;
    }
    const sql = await fs.readFile(path.join(dir, file), 'utf8');
    console.log(`[migrate] apply ${file}`);
    const client = await migrationPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
  console.log('[migrate] done');
}

migrate()
  .then(() => migrationPool.end())
  .catch((err) => {
    console.error('[migrate] failed', err);
    migrationPool.end().finally(() => process.exit(1));
  });