import express from 'express';
import { env } from './env';
import { pool, pingDb } from './db/pool';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/health', async (_req, res) => {
  const dbOk = await pingDb();
  if (!dbOk) {
    res.status(503).json({ ok: false, db: false });
    return;
  }
  res.json({ ok: true, db: true, uptime: process.uptime(), env: env.NODE_ENV });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[error]', err);
    res.status(500).json({ error: 'internal_error' });
  }
);

const server = app.listen(env.PORT, () => {
  console.log(`[server] listening on :${env.PORT} (${env.NODE_ENV})`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`[server] ${signal} received, shutting down`);
  server.close(async () => {
    try {
      await pool.end();
    } catch {
      /* ignore */
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));