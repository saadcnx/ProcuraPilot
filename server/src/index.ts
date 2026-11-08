import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { env } from './env';
import { pool, pingDb } from './db/pool';
import authRouter from './routes/auth';
import { apiLimiter } from './middleware/rateLimit';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: false
  })
);
app.use(
  pinoHttp({
    redact: ['req.headers.authorization', 'req.headers.cookie']
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', async (_req, res) => {
  const dbOk = await pingDb();
  if (!dbOk) {
    res.status(503).json({ ok: false, db: false });
    return;
  }
  res.json({ ok: true, db: true, uptime: process.uptime(), env: env.NODE_ENV });
});

app.use('/api', apiLimiter);
app.use('/api/auth', authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

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