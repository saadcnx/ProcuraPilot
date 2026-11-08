// Shared domain types used by both the client and the server.

export type Role = 'inspector' | 'boss';

export interface LineItem {
  sku: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export type InvoiceStatus = 'held' | 'approved' | 'rejected';

export interface Invoice {
  id: string;
  vendor: string;
  poNumber: string;
  invoiceNumber: string;
  receivedAt: string;
  poLines: LineItem[];
  invoiceLines: LineItem[];
  taxRate: number;
  invoiceTaxCharged: number;
  bankAccount: string;
  bankOnFile: string;
  status: InvoiceStatus;
}

export type FlagKind = 'price' | 'quantity' | 'ghost' | 'tax' | 'bank';

export interface Flag {
  kind: FlagKind;
  sku?: string;
  message: string;
  amount: number;
}

export type Decision = 'approved' | 'rejected' | 'force-approved';

export interface AuditEntry {
  id: string;
  timestamp: string;
  invoiceId: string;
  invoiceNumber: string;
  vendor: string;
  variance: number;
  flagCount: number;
  decision: Decision;
  actor: string;
  actorRole: Role | 'system';
  reason?: string;
}

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  forceApprovals: number;
}

export interface DetectionRules {
  toleranceAmount: number;
  tolerancePercent: number;
  bankCheck: boolean;
  panicThreshold: number;
  panicEmail: string;
  apiKey: string;
}

export interface ComparisonRow {
  sku: string;
  description: string;
  po?: LineItem;
  billed?: LineItem;
  diff: number;
  flags: FlagKind[];
}

export interface ComparisonResult {
  rows: ComparisonRow[];
  flags: Flag[];
  poSubtotal: number;
  invoiceSubtotal: number;
  poTax: number;
  expectedTax: number;
  chargedTax: number;
  poTotal: number;
  invoiceTotal: number;
  variance: number;
  mismatchedItems: number;
  bankMismatch: boolean;
  isClean: boolean;
}