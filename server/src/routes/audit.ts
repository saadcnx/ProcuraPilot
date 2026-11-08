import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { pool } from '../db/pool';
import { toCsv } from '../lib/csv';

const router = Router();

interface AuditRow {
  id: string;
  "timestamp": Date;
  check_id: string;
  invoice_number: string;
  vendor: string;
  variance: string;
  flag_count: number;
  decision: 'approved' | 'rejected' | 'force-approved';
  actor_name: string;
  actor_role: 'boss' | 'inspector' | 'system';
  reason: string | null;
}

function mapEntry(r: AuditRow) {
  return {
    id: r.id,
    timestamp: r.timestamp.toISOString(),
    invoiceId: r.check_id,
    invoiceNumber: r.invoice_number,
    vendor: r.vendor,
    variance: Number(r.variance),
    flagCount: r.flag_count,
    decision: r.decision,
    actor: r.actor_name,
    actorRole: r.actor_role,
    reason: r.reason ?? undefined
  };
}

router.get('/', requireAuth, async (_req, res) => {
  const { rows } = await pool.query<AuditRow>(
    `SELECT id, "timestamp", check_id, invoice_number, vendor, variance::text, flag_count, decision, actor_name, actor_role, reason
     FROM audit_log ORDER BY "timestamp" DESC`
  );
  res.json({ entries: rows.map(mapEntry) });
});

router.get('/export', requireAuth, async (_req, res) => {
  const { rows } = await pool.query<AuditRow>(
    `SELECT id, "timestamp", check_id, invoice_number, vendor, variance::text, flag_count, decision, actor_name, actor_role, reason
     FROM audit_log ORDER BY "timestamp" DESC`
  );
  const csv = toCsv([
    ['Timestamp', 'Invoice', 'Vendor', 'Variance (USD)', 'Flags', 'Decision', 'Decided by', 'Role', 'Reason'],
    ...rows.map((r) => [
      r.timestamp.toISOString(),
      r.invoice_number,
      r.vendor,
      Number(r.variance).toFixed(2),
      String(r.flag_count),
      r.decision,
      r.actor_name,
      r.actor_role,
      r.reason ?? ''
    ])
  ]);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="procurapilot-audit-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
});

export default router;