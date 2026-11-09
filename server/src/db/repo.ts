import { pool } from './pool';
import { DetectionRules, Invoice, LineItem } from '../engine/types';
import { encryptSecret, decryptSecret } from '../lib/secretBox';
import { randomUUID } from 'crypto';

interface CheckRow {
  id: string;
  vendor: string;
  po_number: string;
  invoice_number: string;
  received_at: Date;
  tax_rate: string;
  invoice_tax_charged: string;
  bank_account: string;
  bank_on_file: string;
  status: 'held' | 'approved' | 'rejected';
}

interface LineRow {
  check_id: string;
  side: 'po' | 'invoice';
  sku: string;
  description: string;
  qty: string;
  unit_price: string;
}

export async function loadChecks(filter?: { status?: 'held' | 'approved' | 'rejected' }): Promise<Invoice[]> {
  const where = filter?.status ? 'WHERE status = $1' : '';
  const params = filter?.status ? [filter.status] : [];
  const { rows: checks } = await pool.query<CheckRow>(
    `SELECT id, vendor, po_number, invoice_number, received_at, tax_rate::text, invoice_tax_charged::text, bank_account, bank_on_file, status
     FROM checks ${where} ORDER BY received_at DESC`,
    params
  );
  if (checks.length === 0) return [];
  const ids = checks.map((c) => c.id);
  const { rows: items } = await pool.query<LineRow>(
    `SELECT check_id, side, sku, description, qty::text, unit_price::text
     FROM line_items WHERE check_id = ANY($1) ORDER BY check_id, side, position`,
    [ids]
  );
  const itemsByCheck = new Map<string, { po: LineItem[]; invoice: LineItem[] }>();
  for (const it of items) {
    let bucket = itemsByCheck.get(it.check_id);
    if (!bucket) {
      bucket = { po: [], invoice: [] };
      itemsByCheck.set(it.check_id, bucket);
    }
    const line: LineItem = {
      sku: it.sku,
      description: it.description,
      qty: Number(it.qty),
      unitPrice: Number(it.unit_price)
    };
    (it.side === 'po' ? bucket.po : bucket.invoice).push(line);
  }
  return checks.map((c) => rowToInvoice(c, itemsByCheck.get(c.id) ?? { po: [], invoice: [] }));
}

export async function loadCheck(id: string): Promise<Invoice | null> {
  const { rows: checks } = await pool.query<CheckRow>(
    `SELECT id, vendor, po_number, invoice_number, received_at, tax_rate::text, invoice_tax_charged::text, bank_account, bank_on_file, status
     FROM checks WHERE id = $1`,
    [id]
  );
  if (checks.length === 0) return null;
  const c = checks[0];
  const { rows: items } = await pool.query<LineRow>(
    `SELECT check_id, side, sku, description, qty::text, unit_price::text
     FROM line_items WHERE check_id = $1 ORDER BY check_id, side, position`,
    [id]
  );
  const po: LineItem[] = [];
  const invoice: LineItem[] = [];
  for (const it of items) {
    const line: LineItem = {
      sku: it.sku,
      description: it.description,
      qty: Number(it.qty),
      unitPrice: Number(it.unit_price)
    };
    (it.side === 'po' ? po : invoice).push(line);
  }
  return rowToInvoice(c, { po, invoice });
}

function rowToInvoice(c: CheckRow, items: { po: LineItem[]; invoice: LineItem[] }): Invoice {
  return {
    id: c.id,
    vendor: c.vendor,
    poNumber: c.po_number,
    invoiceNumber: c.invoice_number,
    receivedAt: c.received_at ? c.received_at.toISOString() : new Date().toISOString(),
    taxRate: Number(c.tax_rate),
    invoiceTaxCharged: Number(c.invoice_tax_charged),
    bankAccount: c.bank_account,
    bankOnFile: c.bank_on_file,
    poLines: items.po,
    invoiceLines: items.invoice,
    status: c.status
  };
}

export async function insertCheck(invoice: Invoice, createdBy: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO checks (id, vendor, po_number, invoice_number, received_at, tax_rate, invoice_tax_charged, bank_account, bank_on_file, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [invoice.id, invoice.vendor, invoice.poNumber, invoice.invoiceNumber, invoice.receivedAt, invoice.taxRate, invoice.invoiceTaxCharged, invoice.bankAccount, invoice.bankOnFile, invoice.status, createdBy]
    );
    let pos = 0;
    for (const l of invoice.poLines) {
      await client.query(
        `INSERT INTO line_items (check_id, side, sku, description, qty, unit_price, position) VALUES ($1,'po',$2,$3,$4,$5,$6)`,
        [invoice.id, l.sku, l.description, l.qty, l.unitPrice, pos++]
      );
    }
    pos = 0;
    for (const l of invoice.invoiceLines) {
      await client.query(
        `INSERT INTO line_items (check_id, side, sku, description, qty, unit_price, position) VALUES ($1,'invoice',$2,$3,$4,$5,$6)`,
        [invoice.id, l.sku, l.description, l.qty, l.unitPrice, pos++]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function setCheckStatus(id: string, status: 'approved' | 'rejected'): Promise<boolean> {
  const res = await pool.query("UPDATE checks SET status = $2 WHERE id = $1 AND status = 'held'", [id, status]);
  return (res.rowCount ?? 0) === 1;
}

export async function getVendorAccount(vendorName: string): Promise<string> {
  const { rows } = await pool.query<{ bank_account: string }>(
    'SELECT bank_account FROM vendors WHERE name ILIKE $1 LIMIT 1',
    [vendorName]
  );
  return rows[0]?.bank_account ?? '';
}

export async function decideCheck(
  id: string,
  decision: 'rejected' | 'force-approved',
  reason: string | undefined,
  actor: { id: string; name: string; role: string },
  variance: number,
  flagCount: number,
  invoiceNumber: string,
  vendor: string
): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const status = decision === 'rejected' ? 'rejected' : 'approved';
    const res = await client.query("UPDATE checks SET status = $2 WHERE id = $1 AND status = 'held'", [id, status]);
    if (res.rowCount !== 1) {
      await client.query('ROLLBACK');
      return false;
    }
    await client.query(
      `INSERT INTO audit_log (id, check_id, invoice_number, vendor, variance, flag_count, decision, actor_id, actor_name, actor_role, reason)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [`audit-${randomUUID().slice(0, 8)}`, id, invoiceNumber, vendor, variance, flagCount, decision, actor.id, actor.name, actor.role, reason ?? null]
    );
    if (decision === 'force-approved') {
      await client.query('UPDATE users SET force_approvals = force_approvals + 1 WHERE id = $1', [actor.id]);
    }
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function loadRules(): Promise<DetectionRules> {
  const { rows } = await pool.query<{
    tolerance_amount: string;
    tolerance_percent: string;
    bank_check: boolean;
    panic_threshold: string;
    panic_email: string;
    api_key_encrypted: string;
  }>('SELECT tolerance_amount::text, tolerance_percent::text, bank_check, panic_threshold::text, panic_email, api_key_encrypted FROM rules WHERE id = 1');
  const r = rows[0];
  if (!r) {
    return { toleranceAmount: 5, tolerancePercent: 1, bankCheck: true, panicThreshold: 10000, panicEmail: 'cfo@procurapilot.com', apiKey: '' };
  }
  return {
    toleranceAmount: Number(r.tolerance_amount),
    tolerancePercent: Number(r.tolerance_percent),
    bankCheck: r.bank_check,
    panicThreshold: Number(r.panic_threshold),
    panicEmail: r.panic_email,
    apiKey: decryptSecret(r.api_key_encrypted)
  };
}

export async function saveRules(rules: DetectionRules): Promise<void> {
  await pool.query(
    `UPDATE rules SET tolerance_amount=$1, tolerance_percent=$2, bank_check=$3, panic_threshold=$4, panic_email=$5, api_key_encrypted=$6, updated_at=NOW() WHERE id=1`,
    [rules.toleranceAmount, rules.tolerancePercent, rules.bankCheck, rules.panicThreshold, rules.panicEmail, encryptSecret(rules.apiKey ?? '')]
  );
}