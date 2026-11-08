import React from 'react';
import { Chip } from './Chip';
import { flagMeta } from '../data/flagMeta';
import { ComparisonResult, lineTotal } from '../utils/compare';
import { formatCurrency, formatSignedCurrency } from '../utils/currency';
import { LineItem } from '../types/procurement';

interface ComparisonTableProps {
  result: ComparisonResult;
  taxRate: number;
}

export function ComparisonTable({ result, taxRate }: ComparisonTableProps) {
  const taxFlagged = result.flags.some((f) => f.kind === 'tax');

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-outline-variant text-left text-xs text-ink-variant">
            <th scope="col" className="py-3 pl-5 pr-3 font-medium">Item</th>
            <th scope="col" className="px-3 py-3 text-right font-medium">Ordered</th>
            <th scope="col" className="px-3 py-3 text-right font-medium">Billed</th>
            <th scope="col" className="px-3 py-3 text-right font-medium">Difference</th>
            <th scope="col" className="py-3 pl-3 pr-5 font-medium">Flag</th>
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row) => {
            const flagged = row.flags.length > 0;
            return (
              <tr key={row.sku} className={`border-b border-outline-variant/70 ${flagged ? 'bg-blush/50' : ''}`}>
                <td className="py-3 pl-5 pr-3 align-top">
                  <p className="font-medium text-ink">{row.description}</p>
                  <p className="text-xs text-ink-variant">{row.sku}</p>
                </td>
                <td className="px-3 py-3 text-right align-top tabular-nums">
                  {row.po ? <LineCell line={row.po} /> : <span className="text-ink-variant">Not ordered</span>}
                </td>
                <td className="px-3 py-3 text-right align-top tabular-nums">
                  {row.billed ?
                  <LineCell line={row.billed} compareTo={row.po} /> :

                  <span className="text-ink-variant">Not billed</span>
                  }
                </td>
                <td
                  className={`px-3 py-3 text-right align-top font-medium tabular-nums ${
                  flagged ? 'text-on-tertiary-container' : 'text-ink-variant'}`
                  }>
                  
                  {formatSignedCurrency(row.diff)}
                </td>
                <td className="py-3 pl-3 pr-5 align-top">
                  <div className="flex flex-wrap gap-1">
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
          <tr className="border-b border-outline-variant/70">
            <th scope="row" className="py-3 pl-5 pr-3 text-left font-normal text-ink-variant">Subtotal</th>
            <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(result.poSubtotal)}</td>
            <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(result.invoiceSubtotal)}</td>
            <td className="px-3 py-3 text-right tabular-nums text-ink-variant">
              {formatSignedCurrency(result.invoiceSubtotal - result.poSubtotal)}
            </td>
            <td className="py-3 pl-3 pr-5" />
          </tr>
          <tr className={`border-b border-outline-variant/70 ${taxFlagged ? 'bg-blush/50' : ''}`}>
            <th scope="row" className="py-3 pl-5 pr-3 text-left font-normal text-ink-variant">
              Tax ({(taxRate * 100).toFixed(1)}%)
            </th>
            <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(result.poTax)}</td>
            <td className="px-3 py-3 text-right tabular-nums">
              {formatCurrency(result.chargedTax)}
              {taxFlagged &&
              <p className="text-xs text-ink-variant">should be {formatCurrency(result.expectedTax)}</p>
              }
            </td>
            <td className="px-3 py-3 text-right tabular-nums text-ink-variant">
              {formatSignedCurrency(result.chargedTax - result.poTax)}
            </td>
            <td className="py-3 pl-3 pr-5">
              {taxFlagged &&
              <Chip tone="rose" icon={flagMeta.tax.icon}>
                  {flagMeta.tax.label}
                </Chip>
              }
            </td>
          </tr>
          <tr>
            <th scope="row" className="py-4 pl-5 pr-3 text-left font-medium">Total</th>
            <td className="px-3 py-4 text-right font-medium tabular-nums">{formatCurrency(result.poTotal)}</td>
            <td className="px-3 py-4 text-right font-medium tabular-nums">{formatCurrency(result.invoiceTotal)}</td>
            <td className="px-3 py-4 text-right font-medium tabular-nums">{formatSignedCurrency(result.variance)}</td>
            <td className="py-4 pl-3 pr-5" />
          </tr>
        </tfoot>
      </table>
    </div>);

}

function LineCell({ line, compareTo }: {line: LineItem;compareTo?: LineItem;}) {
  const qtyChanged = compareTo && line.qty !== compareTo.qty;
  const priceChanged = compareTo && line.unitPrice !== compareTo.unitPrice;
  return (
    <>
      <p className="text-ink">
        <span className={qtyChanged ? 'font-medium text-on-tertiary-container' : ''}>{line.qty}</span>
        {' × '}
        <span className={priceChanged ? 'font-medium text-on-tertiary-container' : ''}>
          {formatCurrency(line.unitPrice)}
        </span>
      </p>
      <p className="text-xs text-ink-variant">{formatCurrency(lineTotal(line))}</p>
    </>);

}