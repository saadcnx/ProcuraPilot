import { Router } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { requireAuth, requireSigner } from '../middleware/auth';
import { upload, readUploaded, deleteUploaded } from '../lib/upload';
import { parsePdf, ParsedDoc } from '../lib/pdf';
import { compareInvoice } from '../engine/compare';
import { Invoice } from '../engine/types';
import { loadChecks, loadCheck, insertCheck, setCheckStatus, loadRules } from '../db/repo';
import { pool } from '../db/pool';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const status = req.query.status;
  const parsed = z.object({ status: z.enum(['held', 'approved', 'rejected']).optional() }).safeParse({ status });
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_query' });
    return;
  }
  const rules = await loadRules();
  const invoices = await loadChecks(parsed.data.status ? { status: parsed.data.status } : undefined);
  const checks = invoices.map((invoice) => ({ invoice, result: compareInvoice(invoice, rules) }));
  res.json({ checks });
});

router.get('/:id', requireAuth, async (req, res) => {
  const rules = await loadRules();
  const invoice = await loadCheck(req.params.id);
  if (!invoice) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json({ invoice, result: compareInvoice(invoice, rules) });
});

router.post('/', requireAuth, upload.fields([{ name: 'po_file', maxCount: 1 }, { name: 'invoice_file', maxCount: 1 }]), async (req, res) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const poFile = files?.po_file?.[0];
  const invoiceFile = files?.invoice_file?.[0];
  if (!poFile || !invoiceFile) {
    res.status(400).json({ error: 'both_files_required' });
    return;
  }
  try {
    const [poBuf, invBuf] = await Promise.all([readUploaded(poFile.path), readUploaded(invoiceFile.path)]);
    let poParsed: ParsedDoc;
    let invParsed: ParsedDoc;

    try {
      [poParsed, invParsed] = await Promise.all([parsePdf(poBuf, 'po'), parsePdf(invBuf, 'invoice')]);
    } catch {
      res.status(422).json({ error: 'invalid_pdf_format' });
      return;
    }

    if (poParsed.lines.length === 0 || invParsed.lines.length === 0) {
      res.status(422).json({ error: 'could_not_parse_pdf', po_lines: poParsed.lines.length, invoice_lines: invParsed.lines.length });
      return;
    }
    const subtotal = invParsed.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
    const computedTax = Math.round(subtotal * invParsed.taxRate * 100) / 100;
    const chargedTax = invParsed.chargedTax ?? computedTax;
    const invoice: Invoice = {
      id: `check-${randomUUID().slice(0, 8)}`,
      vendor: invParsed.vendor || poParsed.vendor,
      poNumber: poParsed.referenceNumber || 'PO-UNKNOWN',
      invoiceNumber: invParsed.referenceNumber || 'INV-UNKNOWN',
      receivedAt: new Date().toISOString(),
      poLines: poParsed.lines,
      invoiceLines: invParsed.lines,
      taxRate: invParsed.taxRate,
      invoiceTaxCharged: chargedTax,
      bankAccount: invParsed.bankAccount,
      bankOnFile: invParsed.bankAccount,
      status: 'held'
    };
    const rules = await loadRules();
    const result = compareInvoice(invoice, rules);
    if (result.isClean) invoice.status = 'approved';
    await insertCheck(invoice, req.user!.id);
    if (result.isClean) {
      await pool.query(
        `INSERT INTO audit_log (id, check_id, invoice_number, vendor, variance, flag_count, decision, actor_id, actor_name, actor_role)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [`audit-${randomUUID().slice(0, 8)}`, invoice.id, invoice.invoiceNumber, invoice.vendor, result.variance, 0, 'approved', null, 'Auto-match', 'system']
      );
    }
    res.status(201).json({ invoice, result });
  } finally {
    await Promise.all([deleteUploaded(poFile.path), deleteUploaded(invoiceFile.path)]);
  }
});

const decideSchema = z.object({
  decision: z.enum(['rejected', 'force-approved']),
  reason: z.string().max(2000).optional()
});

router.post('/:id/decide', requireAuth, requireSigner, async (req, res) => {
  const parsed = decideSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_body' });
    return;
  }
  const { decision, reason } = parsed.data;
  if (decision === 'force-approved' && (!reason || reason.trim().length < 20)) {
    res.status(400).json({ error: 'reason_min_20_chars' });
    return;
  }
  const invoice = await loadCheck(req.params.id);
  if (!invoice) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  if (invoice.status !== 'held') {
    res.status(409).json({ error: 'already_decided' });
    return;
  }
  const rules = await loadRules();
  const result = compareInvoice(invoice, rules);
  const newStatus = decision === 'rejected' ? 'rejected' : 'approved';
  await setCheckStatus(invoice.id, newStatus);
  await pool.query(
    `INSERT INTO audit_log (id, check_id, invoice_number, vendor, variance, flag_count, decision, actor_id, actor_name, actor_role, reason)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [`audit-${randomUUID().slice(0, 8)}`, invoice.id, invoice.invoiceNumber, invoice.vendor, result.variance, result.flags.length, decision, req.user!.id, req.user!.name, req.user!.role, reason ?? null]
  );
  if (decision === 'force-approved') {
    await pool.query('UPDATE users SET force_approvals = force_approvals + 1 WHERE id = $1', [req.user!.id]);
  }
  res.json({ ok: true, invoice: { ...invoice, status: newStatus }, result });
});

export default router;