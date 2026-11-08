import { Request, Response, NextFunction } from 'express';
import { env } from '../env';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'not_found' });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status =
    typeof (err as { status?: number })?.status === 'number'
      ? (err as { status: number }).status
      : 500;
  const message =
    status < 500 || env.NODE_ENV !== 'production'
      ? (err as Error)?.message ?? 'error'
      : 'internal_error';
  if (status >= 500) console.error('[error]', err);
  res.status(status).json({ error: message });
}