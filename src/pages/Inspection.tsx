import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeftIcon, LockIcon, SearchXIcon, SirenIcon, TriangleAlertIcon } from 'lucide-react';
import { useCheck, useRules } from '../lib/queries';
import { ComparisonTable } from '../components/ComparisonTable';
import { DecisionPanel } from '../components/DecisionPanel';
import { formatCurrency, formatSignedCurrency } from '../utils/currency';

export function Inspection() {
  const { invoiceId } = useParams();
  const { data, isLoading } = useCheck(invoiceId);
  const { data: rulesData, isLoading: rulesLoading } = useRules();
  const rules = rulesData?.rules;

  const backLink = (
    <Link
      to="/queue"
      className="-ml-3 inline-flex h-10 items-center gap-2 rounded-full pl-3 pr-4 text-sm font-medium text-primary transition-colors duration-150 ease-out hover:bg-primary/[0.08]"
    >
      <ArrowLeftIcon className="h-[18px] w-[18px]" aria-hidden="true" />
      Queue
    </Link>
  );

  if (isLoading || rulesLoading || !rules) {
    return (
      <div className="mx-auto max-w-[1280px]">
        {backLink}
        <div className="py-16 text-center text-sm text-ink-variant">Loading invoice…</div>
      </div>
    );
  }

  const invoice = data?.invoice;
  const result = data?.result;

  if (!invoice || !result) {
    return (
      <div className="mx-auto max-w-[1280px]">
        {backLink}
        <div className="mt-16 flex flex-col items-center text-center">
          <SearchXIcon className="h-8 w-8 text-ink-variant" aria-hidden="true" />
          <h1 className="mt-4 text-xl text-ink">Invoice not found</h1>
          <p className="mt-2 max-w-sm text-sm text-ink-variant">
            It may have been removed from the queue. Head back to see what's still held.
          </p>
        </div>
      </div>
    );
  }

  if (invoice.status !== 'held') {
    return (
      <div className="mx-auto max-w-[1280px]">
        {backLink}
        <div className="mt-16 flex flex-col items-center text-center">
          <SearchXIcon className="h-8 w-8 text-ink-variant" aria-hidden="true" />
          <h1 className="mt-4 text-xl text-ink">This bill has already been decided</h1>
          <p className="mt-2 max-w-sm text-sm text-ink-variant">
            Its decision is recorded in the audit vault.
          </p>
        </div>
      </div>
    );
  }

  const frozen = rules.bankCheck && result.bankMismatch;
  const escalated = Math.abs(result.variance) >= rules.panicThreshold;
  const over = result.variance >= 0;

  return (
    <div className="mx-auto max-w-[1280px]">
      {backLink}

      <header className="mt-3">
        <h1 className="text-[28px] leading-9 text-ink">{invoice.vendor}</h1>
        <p className="mt-1 text-sm text-ink-variant">
          Invoice {invoice.invoiceNumber} · {invoice.poNumber} · <span className="font-medium text-primary">{invoice.department}</span> · Received{' '}
          {format(new Date(invoice.receivedAt), 'MMM d, yyyy, h:mm a')}
        </p>
      </header>

      {invoice.extractionUncertain && (
        <div className="mt-6 space-y-2">
          <div role="status" className="flex gap-3 rounded-xl bg-blush px-5 py-4 text-sm text-on-tertiary-container">
            <TriangleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              <span className="font-medium">Low extraction confidence.</span> The AI had trouble reading this document. Double-check all line items and totals manually.
            </p>
          </div>
        </div>
      )}

      {(frozen || escalated) && (
        <div className="mt-6 space-y-2">
          {frozen && (
            <div
              role="status"
              className="flex gap-3 rounded-xl bg-blush px-5 py-4 text-sm text-on-tertiary-container"
            >
              <LockIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>
                <span className="font-medium">Payment frozen.</span> This invoice pays to{' '}
                {invoice.bankAccount}, but the account on file is {invoice.bankOnFile}. Confirm
                with the vendor by phone before releasing.
              </p>
            </div>
          )}
          {escalated && (
            <div
              role="status"
              className="flex gap-3 rounded-xl bg-blush px-5 py-4 text-sm text-on-tertiary-container"
            >
              <SirenIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>
                <span className="font-medium">Escalated.</span> The gap exceeds{' '}
                {formatCurrency(rules.panicThreshold)}, so {rules.panicEmail} was emailed
                automatically.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <section className="flex flex-wrap items-end gap-x-12 gap-y-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
            <div>
              <p className="text-sm text-ink-variant">
                {over ? 'Billed over the order' : 'Billed under the order'}
              </p>
              <p className="mt-1 text-[45px] leading-[52px] tabular-nums text-ink">
                {formatSignedCurrency(result.variance)}
              </p>
            </div>
            <dl className="flex flex-wrap gap-x-10 gap-y-3 pb-1.5 text-sm">
              <div>
                <dt className="text-ink-variant">Purchase order</dt>
                <dd className="mt-0.5 text-lg tabular-nums text-ink">
                  {formatCurrency(result.poTotal)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-variant">Invoice</dt>
                <dd className="mt-0.5 text-lg tabular-nums text-ink">
                  {formatCurrency(result.invoiceTotal)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-variant">Lines mismatched</dt>
                <dd className="mt-0.5 text-lg tabular-nums text-ink">
                  {result.mismatchedItems} of {result.rows.length}
                </dd>
              </div>
            </dl>
          </section>

          <section
            aria-labelledby="compare-title"
            className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest"
          >
            <div className="px-5 pb-2 pt-5">
              <h2 id="compare-title" className="text-base font-medium text-ink">
                Order vs bill
              </h2>
              <p className="mt-1 text-sm text-ink-variant">
                Lines are flagged when the extra charge exceeds{' '}
                {formatCurrency(rules.toleranceAmount)} or {rules.tolerancePercent}% of the line,
                whichever is larger.
              </p>
            </div>
            <ComparisonTable result={result} taxRate={invoice.taxRate} />
          </section>
        </div>

        <DecisionPanel invoice={invoice} result={result} />
      </div>
    </div>
  );
}