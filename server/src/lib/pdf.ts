import pdf from 'pdf-parse';
import { LineItem } from '../engine/types';

export interface ParsedDoc {
  vendor: string;
  referenceNumber: string;
  taxRate: number;
  chargedTax: number | null;
  bankAccount: string;
  lines: LineItem[];
  rawText: string;
}

export async function parsePdf(buffer: Buffer, kind: 'po' | 'invoice'): Promise<ParsedDoc> {
  try {
    const data = await pdf(buffer);
    return parseDocumentText(data.text, kind);
  } catch (error) {
    console.error('PDF parse error:', error);
    return {
      vendor: '',
      referenceNumber: '',
      taxRate: 0,
      chargedTax: null,
      bankAccount: '',
      lines: [],
      rawText: ''
    };
  }
}

export function parseDocumentText(text: string, kind: 'po' | 'invoice'): ParsedDoc {
  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return {
    vendor: detectVendor(rawLines),
    referenceNumber: detectRef(text, kind),
    taxRate: detectTaxRate(text),
    chargedTax: detectChargedTax(text),
    bankAccount: detectBankAccount(text),
    lines: detectLines(rawLines),
    rawText: text
  };
}

function detectVendor(lines: string[]): string {
  const skip = /^(purchase\s*order|invoice|bill|from|to|date|page|ref|tel|fax|address|www|http|\+?\d)/i;
  for (const line of lines) {
    if (line.length < 3) continue;
    if (skip.test(line)) continue;
    if (/^\d/.test(line)) continue;
    return line.slice(0, 120);
  }
  return 'Unknown vendor';
}

function detectRef(text: string, kind: 'po' | 'invoice'): string {
  const patterns = kind === 'po'
    ? [/purchase\s*order\s*[#:]*\s*([A-Z0-9][A-Z0-9\-/]{2,})/i, /\bPO[-#\s:]*([A-Z0-9][A-Z0-9\-/]{2,})/i]
    : [/invoice\s*(?:number|no|#|:)*\s*([A-Z0-9][A-Z0-9\-/]{2,})/i, /\bINV[-#\s:]*([A-Z0-9][A-Z0-9\-/]{2,})/i];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1] && m[1].length >= 3) return m[1];
  }
  return '';
}

function detectTaxRate(text: string): number {
  const m = text.match(/tax(?:\s*rate)?[^\d%]{0,20}(\d+(?:\.\d+)?)\s*%/i);
  if (m) return Number(m[1]) / 100;
  return 0;
}

function detectChargedTax(text: string): number | null {
  const m = text.match(/(?:sales\s*)?tax[^\d$]{0,20}\$?\s*([\d,]+\.\d{2})/i);
  return m ? Number(m[1].replace(/,/g, '')) : null;
}

function detectBankAccount(text: string): string {
  const patterns = [/••••\s*(\d{3,6})/, /[*xX]{2,}\s*(\d{3,6})/, /(?:ending|last\s*4|acct|account)[^\d]{0,15}(\d{3,6})/i];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return `•••• ${m[1]}`;
  }
  return '';
}

function detectLines(lines: string[]): LineItem[] {
  const items: LineItem[] = [];
  for (const line of lines) {
    const m = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s+(?:@\s*)?\$?([\d,]+\.\d{2})\s+(?:=?\s*\$?([\d,]+\.\d{2}))?$/);
    if (!m) continue;
    const desc = m[1].trim();
    if (desc.length < 2 || /^[0-9\s]+$/.test(desc)) continue;
    const qty = Number(m[2]);
    const unitPrice = Number(m[3].replace(/,/g, ''));
    if (!qty || !unitPrice || unitPrice < 0.01) continue;
    const skuMatch = desc.match(/^([A-Z]{2,}[A-Z0-9\-]*\d[A-Z0-9\-]*)\s+(.+)$/);
    const sku = skuMatch ? skuMatch[1] : `SKU-${items.length + 1}`;
    const description = skuMatch ? skuMatch[2] : desc;
    items.push({ sku, description, qty, unitPrice });
  }
  return items;
}