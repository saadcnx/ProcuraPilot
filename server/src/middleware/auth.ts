import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../lib/jwt';
import { pool } from '../db/pool';

export interface AuthedUser {
  id: string;
  name: string;
  email: string;
  role: 'inspector' | 'boss';
  active: boolean;
  forceApprovals: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'inspector' | 'boss';
  active: boolean;
  force_approvals: number;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) {
    res.status(401).json({ error: 'unauthenticated' });
    return;
  }
  let payload: TokenPayload;
  try {
    payload = verifyToken(token);
  } catch {
    res.status(401).json({ error: 'invalid_token' });
    return;
  }
  const { rows } = await pool.query<UserRow>(
    'SELECT id, name, email, role, active, force_approvals FROM users WHERE id = $1',
    [payload.sub]
  );
  const row = rows[0];
  if (!row || !row.active) {
    res.status(401).json({ error: 'inactive_or_missing' });
    return;
  }
  req.user = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    active: row.active,
    forceApprovals: row.force_approvals
  };
  next();
}

export function requireSigner(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'boss') {
    res.status(403).json({ error: 'signer_only' });
    return;
  }
  next();
}