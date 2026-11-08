import { DetectionRules, Flag, FlagKind, Invoice, LineItem, ComparisonRow, ComparisonResult } from './types';

export function compareInvoice(invoice: Invoice, rules: DetectionRules): ComparisonResult {
  const skus = Array.from(new Set([...invoice.poLines.map((l) => l.sku), ...invoice.invoiceLines.map((l) => l.sku)]));
  const flags: Flag[] = [];

  const rows: ComparisonRow[] = skus.map((sku) => {
    const po = invoice.poLines.find((l) => l.sku === sku);
    const billed = invoice.invoiceLines.find((l) => l.sku === sku);
    const diff = lineTotal(billed) - lineTotal(po);
    const allowance = Math.max(rules.toleranceAmount, (lineTotal(po) * rules.tolerancePercent) / 100);
    const rowFlags: FlagKind[] = [];

    if (billed && !po) {
      rowFlags.push('ghost');
      flags.push({ kind: 'ghost', sku, message: `"${billed.description}" was never on the order`, amount: lineTotal(billed) });
    } else if (po && billed && diff > allowance) {
      if (billed.unitPrice > po.unitPrice) {
        rowFlags.push('price');
        flags.push({ kind: 'price', sku, message: `${billed.description}: ${fmt(po.unitPrice)} → ${fmt(billed.unitPrice)} per unit`, amount: (billed.unitPrice - po.unitPrice) * billed.qty });
      }
      if (billed.qty > po.qty) {
        rowFlags.push('quantity');
        flags.push({ kind: 'quantity', sku, message: `${billed.description}: ordered ${po.qty}, billed ${billed.qty}`, amount: (billed.qty - po.qty) * po.unitPrice });
      }
    }

    return { sku, description: (billed ?? po)?.description ?? sku, po, billed, diff, flags: rowFlags };
  });

  const poSubtotal = round(invoice.poLines.reduce((s, l) => s + lineTotal(l), 0));
  const invoiceSubtotal = round(invoice.invoiceLines.reduce((s, l) => s + lineTotal(l), 0));
  const poTax = round(poSubtotal * invoice.taxRate);
  const expectedTax = round(invoiceSubtotal * invoice.taxRate);
  const chargedTax = invoice.invoiceTaxCharged;

  if (Math.abs(chargedTax - expectedTax) > 0.5) {
    flags.push({
      kind: 'tax',
      message: `Charged ${fmt(chargedTax)}; ${(invoice.taxRate * 100).toFixed(1)}% of the billed subtotal is ${fmt(expectedTax)}`,
      amount: chargedTax - expectedTax
    });
  }

  const bankMismatch = invoice.bankAccount !== invoice.bankOnFile;
  if (rules.bankCheck && bankMismatch) {
    flags.push({ kind: 'bank', message: `Invoice pays to ${invoice.bankAccount}; account on file is ${invoice.bankOnFile}`, amount: 0 });
  }

  const poTotal = round(poSubtotal + poTax);
  const invoiceTotal = round(invoiceSubtotal + chargedTax);

  return {
    rows, flags, poSubtotal, invoiceSubtotal, poTax, expectedTax, chargedTax, poTotal, invoiceTotal,
    variance: round(invoiceTotal - poTotal),
    mismatchedItems: rows.filter((r) => r.flags.length > 0).length,
    bankMismatch,
    isClean: flags.length === 0
  };
}

export function lineTotal(line?: LineItem): number {
  return line ? line.qty * line.unitPrice : 0;
}

function round(v: number): number {
  return Math.round(v * 100) / 100;
}

function fmt(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
}