import bcrypt from 'bcryptjs';
import { pool } from './pool';
import { env } from '../env';

type SeedRole = 'inspector' | 'boss';
type SeedStatus = 'held' | 'approved' | 'rejected';
type SeedDecision = 'approved' | 'rejected' | 'force-approved';
type SeedActorRole = 'boss' | 'inspector' | 'system';

interface SeedUser {
  id: string;
  name: string;
  email: string;
  role: SeedRole;
  active: boolean;
  forceApprovals: number;
}

interface SeedLine {
  sku: string;
  description: string;
  qty: number;
  unitPrice: number;
}

interface SeedInvoice {
  id: string;
  vendor: string;
  poNumber: string;
  invoiceNumber: string;
  receivedAt: string;
  poLines: SeedLine[];
  invoiceLines: SeedLine[];
  taxRate: number;
  invoiceTaxCharged: number;
  bankAccount: string;
  bankOnFile: string;
  status: SeedStatus;
}

interface SeedAudit {
  id: string;
  timestamp: string;
  invoiceId: string;
  invoiceNumber: string;
  vendor: string;
  variance: number;
  flagCount: number;
  decision: SeedDecision;
  actor: string;
  actorRole: SeedActorRole;
  reason?: string;
}

const DEMO_PASSWORD = 'pilot123';

const users: SeedUser[] = [
  { id: 'u1', name: 'Ayesha Khan', email: 'ayesha.khan@procurapilot.com', role: 'boss', active: true, forceApprovals: 3 },
  { id: 'u2', name: 'Bilal Ahmed', email: 'bilal.ahmed@procurapilot.com', role: 'inspector', active: true, forceApprovals: 0 },
  { id: 'u3', name: 'Sana Mirza', email: 'sana.mirza@procurapilot.com', role: 'boss', active: true, forceApprovals: 11 },
  { id: 'u4', name: 'Hira Siddiqui', email: 'hira.siddiqui@procurapilot.com', role: 'inspector', active: true, forceApprovals: 0 },
  { id: 'u5', name: 'Omar Farooq', email: 'omar.farooq@procurapilot.com', role: 'inspector', active: false, forceApprovals: 0 }
];

const invoices: SeedInvoice[] = [
  {
    id: 'harbor-steel-88213',
    vendor: 'Harbor Steel Supply',
    poNumber: 'PO-20418',
    invoiceNumber: 'HS-88213',
    receivedAt: '2026-11-07T09:14:22',
    poLines: [
      { sku: 'STL-204', description: 'Galvanized steel bracket, 40mm', qty: 500, unitPrice: 3.2 },
      { sku: 'STL-311', description: 'Hex bolt M10, box of 100', qty: 40, unitPrice: 18.5 },
      { sku: 'STL-090', description: 'Anchor plate, 6mm', qty: 120, unitPrice: 11.75 }
    ],
    invoiceLines: [
      { sku: 'STL-204', description: 'Galvanized steel bracket, 40mm', qty: 500, unitPrice: 3.65 },
      { sku: 'STL-311', description: 'Hex bolt M10, box of 100', qty: 60, unitPrice: 18.5 },
      { sku: 'STL-090', description: 'Anchor plate, 6mm', qty: 120, unitPrice: 11.75 },
      { sku: 'STL-777', description: 'Expedited handling fee', qty: 1, unitPrice: 240 }
    ],
    taxRate: 0.08,
    invoiceTaxCharged: 366.8,
    bankAccount: '•••• 4410',
    bankOnFile: '•••• 4410',
    status: 'held'
  },
  {
    id: 'coastal-freight-1189',
    vendor: 'Coastal Freight Partners',
    poNumber: 'PO-20442',
    invoiceNumber: 'CFP-1189',
    receivedAt: '2026-11-07T15:48:03',
    poLines: [
      { sku: 'FRT-010', description: 'Container freight, Karachi → Rotterdam', qty: 2, unitPrice: 6850 },
      { sku: 'FRT-044', description: 'Port handling', qty: 2, unitPrice: 420 }
    ],
    invoiceLines: [
      { sku: 'FRT-010', description: 'Container freight, Karachi → Rotterdam', qty: 2, unitPrice: 12400 },
      { sku: 'FRT-044', description: 'Port handling', qty: 2, unitPrice: 420 }
    ],
    taxRate: 0,
    invoiceTaxCharged: 0,
    bankAccount: '•••• 8812',
    bankOnFile: '•••• 8812',
    status: 'held'
  },
  {
    id: 'meridian-lab-30471',
    vendor: 'Meridian Lab Instruments',
    poNumber: 'PO-20397',
    invoiceNumber: 'MLI-30471',
    receivedAt: '2026-11-06T11:02:57',
    poLines: [
      { sku: 'LAB-501', description: 'Digital pipette, 10–100 μL', qty: 12, unitPrice: 410 },
      { sku: 'LAB-622', description: 'Centrifuge tubes, case of 500', qty: 30, unitPrice: 64 }
    ],
    invoiceLines: [
      { sku: 'LAB-501', description: 'Digital pipette, 10–100 μL', qty: 12, unitPrice: 410 },
      { sku: 'LAB-622', description: 'Centrifuge tubes, case of 500', qty: 30, unitPrice: 64 }
    ],
    taxRate: 0,
    invoiceTaxCharged: 0,
    bankAccount: '•••• 7731',
    bankOnFile: '•••• 2094',
    status: 'held'
  },
  {
    id: 'northwind-5520',
    vendor: 'Northwind Office Co.',
    poNumber: 'PO-20431',
    invoiceNumber: 'NW-5520',
    receivedAt: '2026-11-06T16:30:41',
    poLines: [
      { sku: 'OFC-112', description: 'A4 copy paper, 5-ream case', qty: 80, unitPrice: 34 },
      { sku: 'OFC-245', description: 'Toner cartridge, black', qty: 24, unitPrice: 89 }
    ],
    invoiceLines: [
      { sku: 'OFC-112', description: 'A4 copy paper, 5-ream case', qty: 80, unitPrice: 34 },
      { sku: 'OFC-245', description: 'Toner cartridge, black', qty: 24, unitPrice: 89 }
    ],
    taxRate: 0.07,
    invoiceTaxCharged: 412.76,
    bankAccount: '•••• 0937',
    bankOnFile: '•••• 0937',
    status: 'held'
  },
  {
    id: 'greenleaf-0402',
    vendor: 'Greenleaf Packaging',
    poNumber: 'PO-20450',
    invoiceNumber: 'GLP-0402',
    receivedAt: '2026-11-08T08:21:10',
    poLines: [
      { sku: 'PKG-300', description: 'Corrugated box, 18×12×10 in', qty: 2000, unitPrice: 0.92 },
      { sku: 'PKG-310', description: 'Packing tape, 48mm', qty: 150, unitPrice: 2.4 }
    ],
    invoiceLines: [
      { sku: 'PKG-300', description: 'Corrugated box, 18×12×10 in', qty: 2000, unitPrice: 0.93 },
      { sku: 'PKG-310', description: 'Packing tape, 48mm', qty: 150, unitPrice: 2.4 }
    ],
    taxRate: 0.05,
    invoiceTaxCharged: 111,
    bankAccount: '•••• 5526',
    bankOnFile: '•••• 5526',
    status: 'held'
  }
];

const auditEntries: SeedAudit[] = [
  {
    id: 'audit-0004',
    timestamp: '2026-11-06T16:42:09',
    invoiceId: 'pinecrest-2231',
    invoiceNumber: 'PC-2231',
    vendor: 'Pinecrest Catering',
    variance: 182.4,
    flagCount: 1,
    decision: 'force-approved',
    actor: 'Sana Mirza',
    actorRole: 'boss',
    reason: 'Weekend surcharge agreed by the ops lead on a call; written confirmation filed under PO-20371.'
  },
  {
    id: 'audit-0003',
    timestamp: '2026-11-05T11:03:51',
    invoiceId: 'delta-9910',
    invoiceNumber: 'DF-9910',
    vendor: 'Delta Fasteners',
    variance: 1240,
    flagCount: 3,
    decision: 'rejected',
    actor: 'Ayesha Khan',
    actorRole: 'boss'
  },
  {
    id: 'audit-0002',
    timestamp: '2026-11-04T09:27:14',
    invoiceId: 'brightway-4410',
    invoiceNumber: 'BJ-4410',
    vendor: 'Brightway Janitorial',
    variance: 0,
    flagCount: 0,
    decision: 'approved',
    actor: 'Auto-match',
    actorRole: 'system'
  },
  {
    id: 'audit-0001',
    timestamp: '2026-11-03T15:55:30',
    invoiceId: 'coastal-1102',
    invoiceNumber: 'CFP-1102',
    vendor: 'Coastal Freight Partners',
    variance: 640,
    flagCount: 1,
    decision: 'force-approved',
    actor: 'Sana Mirza',
    actorRole: 'boss',
    reason: 'Fuel surcharge per contract clause 7.2; amount within the quarterly cap.'
  }
];

async function seed(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, env.BCRYPT_ROUNDS);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role, active, force_approvals)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           active = EXCLUDED.active,
           force_approvals = EXCLUDED.force_approvals`,
        [u.id, u.name, u.email, passwordHash, u.role, u.active, u.forceApprovals]
      );
    }

    for (const inv of invoices) {
      await client.query(
        `INSERT INTO checks (id, vendor, po_number, invoice_number, received_at, tax_rate, invoice_tax_charged, bank_account, bank_on_file, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO UPDATE SET
           vendor = EXCLUDED.vendor,
           po_number = EXCLUDED.po_number,
           invoice_number = EXCLUDED.invoice_number,
           received_at = EXCLUDED.received_at,
           tax_rate = EXCLUDED.tax_rate,
           invoice_tax_charged = EXCLUDED.invoice_tax_charged,
           bank_account = EXCLUDED.bank_account,
           bank_on_file = EXCLUDED.bank_on_file,
           status = EXCLUDED.status`,
        [inv.id, inv.vendor, inv.poNumber, inv.invoiceNumber, inv.receivedAt, inv.taxRate, inv.invoiceTaxCharged, inv.bankAccount, inv.bankOnFile, inv.status]
      );

      await client.query('DELETE FROM line_items WHERE check_id = $1', [inv.id]);

      let pos = 0;
      for (const l of inv.poLines) {
        await client.query(
          `INSERT INTO line_items (check_id, side, sku, description, qty, unit_price, position)
           VALUES ($1,'po',$2,$3,$4,$5,$6)`,
          [inv.id, l.sku, l.description, l.qty, l.unitPrice, pos++]
        );
      }
      pos = 0;
      for (const l of inv.invoiceLines) {
        await client.query(
          `INSERT INTO line_items (check_id, side, sku, description, qty, unit_price, position)
           VALUES ($1,'invoice',$2,$3,$4,$5,$6)`,
          [inv.id, l.sku, l.description, l.qty, l.unitPrice, pos++]
        );
      }
    }

    for (const a of auditEntries) {
      const actor = users.find((u) => u.name === a.actor);
      await client.query(
        `INSERT INTO audit_log (id, check_id, "timestamp", invoice_number, vendor, variance, flag_count, decision, actor_id, actor_name, actor_role, reason)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (id) DO NOTHING`,
        [a.id, a.invoiceId, a.timestamp, a.invoiceNumber, a.vendor, a.variance, a.flagCount, a.decision, actor?.id ?? null, a.actor, a.actorRole, a.reason ?? null]
      );
    }

    await client.query('COMMIT');
    console.log('[seed] done');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

seed()
  .then(() => pool.end())
  .catch((err) => {
    console.error('[seed] failed', err);
    pool.end().finally(() => process.exit(1));
  });