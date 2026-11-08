import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { requireAuth, requireSigner } from '../middleware/auth';
import { pool } from '../db/pool';
import { env } from '../env';

const router = Router();

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'inspector' | 'boss';
  active: boolean;
  force_approvals: number;
}

function mapUser(r: UserRow) {
  return { id: r.id, name: r.name, email: r.email, role: r.role, active: r.active, forceApprovals: r.force_approvals };
}

router.get('/', requireAuth, async (_req, res) => {
  const { rows } = await pool.query<UserRow>(
    'SELECT id, name, email, role, active, force_approvals FROM users ORDER BY active DESC, force_approvals DESC'
  );
  res.json({ users: rows.map(mapUser) });
});

const inviteSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(320),
  role: z.enum(['inspector', 'boss'])
});

router.post('/', requireAuth, requireSigner, async (req, res) => {
  const parsed = inviteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_body' });
    return;
  }
  const email = parsed.data.email.trim().toLowerCase();
  const existing = await pool.query('SELECT 1 FROM users WHERE lower(email) = $1', [email]);
  if (existing.rowCount && existing.rowCount > 0) {
    res.status(409).json({ error: 'email_in_use' });
    return;
  }
  // Temporary password — user should reset via future flow
  const passwordHash = await bcrypt.hash('pilot123', env.BCRYPT_ROUNDS);
  const id = `u-${randomUUID().slice(0, 8)}`;
  const { rows } = await pool.query<UserRow>(
    `INSERT INTO users (id, name, email, password_hash, role, active, force_approvals)
     VALUES ($1,$2,$3,$4,$5,true,0)
     RETURNING id, name, email, role, active, force_approvals`,
    [id, parsed.data.name.trim(), email, passwordHash, parsed.data.role]
  );
  res.status(201).json({ user: mapUser(rows[0]) });
});

const patchSchema = z.object({ active: z.boolean() });

router.patch('/:id', requireAuth, requireSigner, async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_body' });
    return;
  }
  if (req.params.id === req.user!.id && parsed.data.active === false) {
    res.status(400).json({ error: 'cannot_deactivate_self' });
    return;
  }
  const { rows } = await pool.query<UserRow>(
    `UPDATE users SET active = $2 WHERE id = $1 RETURNING id, name, email, role, active, force_approvals`,
    [req.params.id, parsed.data.active]
  );
  if (rows.length === 0) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json({ user: mapUser(rows[0]) });
});

export default router;