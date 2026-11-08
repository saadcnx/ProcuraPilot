import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { pool } from '../db/pool';
import { signToken } from '../lib/jwt';
import { requireAuth } from '../middleware/auth';
import { loginLimiter } from '../middleware/rateLimit';

const router = Router();

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(256)
});

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'inspector' | 'boss';
  active: boolean;
  force_approvals: number;
}

function toTeamUser(row: UserRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    active: row.active,
    forceApprovals: row.force_approvals
  };
}

router.post('/login', loginLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_body' });
    return;
  }
  const email = parsed.data.email.trim().toLowerCase();
  const { rows } = await pool.query<UserRow>(
    'SELECT id, name, email, password_hash, role, active, force_approvals FROM users WHERE lower(email) = $1',
    [email]
  );
  const row = rows[0];
  if (!row) {
    res.status(401).json({ error: 'invalid_credentials' });
    return;
  }
  if (!row.active) {
    res.status(403).json({ error: 'account_revoked' });
    return;
  }
  const ok = await bcrypt.compare(parsed.data.password, row.password_hash);
  if (!ok) {
    res.status(401).json({ error: 'invalid_credentials' });
    return;
  }
  const token = signToken({ sub: row.id, role: row.role, name: row.name });
  res.json({ token, user: toTeamUser(row) });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', (_req, res) => {
  res.json({ ok: true });
});

export default router;