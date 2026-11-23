import { Pool } from 'pg';
import { env } from '../env';

const databaseUrl = env.DATABASE_URL;
const sslRequired =
  env.NODE_ENV === 'production' ||
  /sslmode=require|ssl=true/i.test(databaseUrl) ||
  /\.(supabase\.co|neon\.tech|rds\.amazonaws\.com|render\.com|railway\.app)/i.test(databaseUrl);

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: sslRequired ? { rejectUnauthorized: false } : undefined
});

pool.on('error', (err) => {
  console.error('[db] idle client error', err);
});

export async function pingDb(): Promise<boolean> {
  try {
    const res = await pool.query('SELECT 1 AS ok');
    return res.rows[0]?.ok === 1;
  } catch {
    return false;
  }
}