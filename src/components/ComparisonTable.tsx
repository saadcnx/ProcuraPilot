import React from 'react';
import { Chip } from './Chip';
import { flagMeta } from '../data/flagMeta';
import { ComparisonResult } from '../../shared/types';
import { formatCurrency, formatSignedCurrency } from '../utils/currency';
import { LineItem } from '../../shared/types';

interface ComparisonTableProps {
  result: ComparisonResult;
  taxRate: number;
}

export function ComparisonTable({ result, taxRate }: ComparisonTableProps) {
  const taxFlagged = result.flags.some((f) => f.kind === 'tax');

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-surface-container-lowest">
          <tr className="border-b border-outline-variant text-left text-xs text-ink-variant">
            <th scope="col" className="py-4 pl-6 pr-3 font-medium">Product</th>
            <th scope="col" className="px-3 py-4 text-right font-medium">You Ordered</th>
            <th scope="col" className="px-3 py-4 text-right font-medium">They Billed</th>
            <th scope="col" className="px-3 py-4 text-right font-medium">Difference</th>
            <th scope="col" className="py-4 pl-3 pr-6 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row) => {
            const flagged = row.flags.length > 0;
            return (
              <tr key={row.sku} className={`border-b border-outline-variant/60 transition-colors hover:bg-surface-container-lowest ${flagged ? 'bg-blush/30' : ''}`}>
                <td className="py-4 pl-6 pr-3 align-top">
                  <p className="font-medium text-ink">{row.description}</p>
                  <p className="text-xs text-ink-variant">{row.sku}</p>
                </td>
                <td className="px-3 py-4 text-right align-top tabular-nums">
                  {row.po ? <LineCell line={row.po} /> : <span className="text-ink-variant">Not ordered</span>}
                </td>
                <td className="px-3 py-4 text-right align-top tabular-nums">
                  {row.billed ?
                  <LineCell line={row.billed} compareTo={row.po} /> :
                  <span className="text-ink-variant">Not billed</span>
                  }
                </td>
                <td className={`px-3 py-4 text-right align-top font-medium tabular-nums ${flagged ? 'text-error' : 'text-ink-variant'}`}>
                  {formatSignedCurrency(row.diff)}
                </td>
                <td className="py-4 pl-3 pr-6 align-top">
                  <div className="flex flex-wrap gap-1">
                    {row.flags.length === 0 && (
                      <span className="text-xs text-ink-variant">Looks good</span>
                    )}
                    {row.flags.map((kind) =>
                    <Chip key={kind} tone="rose" icon={flagMeta[kind].icon}>
                        {flagMeta[kind].label}
                      </Chip>
                    )}
                  </div>
                </td>
              </tr>);
          })}
        </tbody>
        <tfoot className="text-ink">
          <tr className="border-b border-outline-variant/60">
            <th scope="row" className="py-4 pl-6 pr-3 text-left font-normal text-ink-variant">Subtotal</th>
            <td className="px-3 py-4 text-right tabular-nums">{formatCurrency(result.poSubtotal)}</td>
            <td className="px-3 py-4 text-right tabular-nums">{formatCurrency(result.invoiceSubtotal)}</td>
            <td className="px-3 py-4 text-right tabular-nums text-ink-variant">
              {formatSignedCurrency(result.invoiceSubtotal - result.poSubtotal)}
            </td>
            <td className="py-4 pl-3 pr-6" />
          </tr>
          <tr className={`border-b border-outline-variant/60 ${taxFlagged ? 'bg-blush/30' : ''}`}>
            <th scope="row" className="py-4 pl-6 pr-3 text-left font-normal text-ink-variant">
              Tax ({(taxRate * 100).toFixed(1)}%)
            </th>
            <td className="px-3 py-4 text-right tabular-nums">{formatCurrency(result.poTax)}</td>
            <td className="px-3 py-4 text-right tabular-nums">
              {formatCurrency(result.chargedTax)}
              {taxFlagged &&
              <p className="text-xs text-error font-medium">should be {formatCurrency(result.expectedTax)}</p>
              }
            </td>
            <td className="px-3 py-4 text-right tabular-nums text-ink-variant">
              {formatSignedCurrency(result.chargedTax - result.poTax)}
            </td>
            <td className="py-4 pl-3 pr-6">
              {taxFlagged &&
              <Chip tone="rose" icon={flagMeta.tax.icon}>
                  {flagMeta.tax.label}
                </Chip>
              }
            </td>
          </tr>
          <tr className="bg-surface-container-lowest">
            <th scope="row" className="py-5 pl-6 pr-3 text-left font-medium">Final Total</th>
            <td className="px-3 py-5 text-right font-medium tabular-nums">{formatCurrency(result.poTotal)}</td>
            <td className="px-3 py-5 text-right font-medium tabular-nums">{formatCurrency(result.invoiceTotal)}</td>
            <td className={`px-3 py-5 text-right font-medium tabular-nums ${result.variance > 0 ? 'text-error' : 'text-ink'}`}>
              {formatSignedCurrency(result.variance)}
            </td>
            <td className="py-5 pl-3 pr-6" />
          </tr>
        </tfoot>
      </table>
    </div>);
}

function lineTotal(line?: LineItem): number {
  return line ? line.qty * line.unitPrice : 0;
}

function LineCell({ line, compareTo }: {line: LineItem;compareTo?: LineItem;}) {
  const qtyChanged = compareTo && line.qty !== compareTo.qty;
  const priceChanged = compareTo && line.unitPrice !== compareTo.unitPrice;
  return (
    <>
      <p className="text-ink">
        <span className={qtyChanged ? 'font-bold text-error' : ''}>{line.qty}</span>
        {' × '}
        <span className={priceChanged ? 'font-bold text-error' : ''}>
          {formatCurrency(line.unitPrice)}
        </span>
      </p>
      <p className="text-xs text-ink-variant">{formatCurrency(lineTotal(line))}</p>
    </>);
}