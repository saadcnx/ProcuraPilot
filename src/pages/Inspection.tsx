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
  const { data, isLoading, error: checkError } = useCheck(invoiceId);
  const { data: rulesData, isLoading: rulesLoading, error: rulesError } = useRules();
  const rules = rulesData?.rules;

  const backLink = (
    <Link
      to="/queue"
      className="-ml-3 inline-flex h-10 items-center gap-2 rounded-full pl-3 pr-4 text-sm font-medium text-primary transition-colors duration-150 ease-out hover:bg-primary/[0.08]"
    >
      <ArrowLeftIcon className="h-[18px] w-[18px]" aria-hidden="true" />
      Back to Queue
    </Link>
  );

  if (checkError || rulesError) {
    return (
      <div className="mx-auto max-w-[1280px] p-6">
        {backLink}
        <div className="py-16 text-center text-sm text-error font-medium">
          Could not load this invoice. Please refresh the page.
        </div>
      </div>
    );
  }

  if (isLoading || rulesLoading || !rules) {
    return (
      <div className="mx-auto max-w-[1280px] p-6">
        {backLink}
        <div className="py-16 text-center text-sm text-ink-variant animate-pulse">Loading invoice details...</div>
      </div>
    );
  }

  const invoice = data?.invoice;
  const result = data?.result;

  if (!invoice || !result) {
    return (
      <div className="mx-auto max-w-[1280px] p-6">
        {backLink}
        <div className="mt-16 flex flex-col items-center text-center">
          <SearchXIcon className="h-10 w-10 text-ink-variant" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-medium text-ink">Invoice not found</h1>
          <p className="mt-2 max-w-sm text-sm text-ink-variant">
            It may have been removed from the queue or already decided.
          </p>
        </div>
      </div>
    );
  }

  if (invoice.status !== 'held') {
    return (
      <div className="mx-auto max-w-[1280px] p-6">
        {backLink}
        <div className="mt-16 flex flex-col items-center text-center">
          <SearchXIcon className="h-10 w-10 text-ink-variant" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-medium text-ink">Already decided</h1>
          <p className="mt-2 max-w-sm text-sm text-ink-variant">
            The decision for this invoice is recorded in the Audit Vault.
          </p>
        </div>
      </div>
    );
  }

  const frozen = rules.bankCheck && result.bankMismatch;
  const escalated = Math.abs(result.variance) >= rules.panicThreshold;
  const isOvercharged = result.variance > 0;

  return (
    <div className="mx-auto max-w-[1280px] p-6">
      {backLink}

      <header className="mt-4 mb-8">
        <h1 className="text-2xl font-medium text-ink">{invoice.vendor}</h1>
        <p className="mt-1 text-sm text-ink-variant">
          Invoice #{invoice.invoiceNumber} · PO #{invoice.poNumber} · {format(new Date(invoice.receivedAt), 'MMM d, yyyy')}
        </p>
      </header>

      {invoice.extractionUncertain && (
        <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <TriangleAlertIcon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>
            <span className="font-bold">Warning:</span> The system had trouble reading this document. Double-check all numbers manually.
          </p>
        </div>
      )}

      {(frozen || escalated) && (
        <div className="mb-6 space-y-3">
          {frozen && (
            <div className="flex gap-3 rounded-xl bg-error/10 px-5 py-4 text-sm text-error font-medium">
              <LockIcon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p>Bank account on this invoice does not match the account we have on file. Payment is frozen.</p>
            </div>
          )}
          {escalated && (
            <div className="flex gap-3 rounded-xl bg-error/10 px-5 py-4 text-sm text-error font-medium">
              <SirenIcon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p>This error is very large. A manager has been alerted.</p>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="space-y-8">
          {/* Big Summary Card */}
          <section className={`rounded-xl border p-8 ${isOvercharged ? 'border-error/30 bg-error/[0.02]' : 'border-primary/30 bg-primary/[0.02]'}`}>
            <h2 className="text-sm font-medium uppercase tracking-wider text-ink-variant mb-6">The Bottom Line</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-sm text-ink-variant mb-1">You agreed to pay</p>
                <p className="text-2xl font-medium text-ink">{formatCurrency(result.poTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-ink-variant mb-1">They are asking for</p>
                <p className="text-2xl font-medium text-ink">{formatCurrency(result.invoiceTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-ink-variant mb-1">Difference</p>
                <p className={`text-3xl font-bold ${isOvercharged ? 'text-error' : 'text-primary'}`}>
                  {formatSignedCurrency(result.variance)}
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm text-ink-variant">
              {isOvercharged 
                ? `This invoice asks for ${formatCurrency(result.variance)} more than the original order.` 
                : `This invoice matches the original order or is cheaper.`}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-ink mb-4">Line-by-Line Comparison</h2>
            <ComparisonTable result={result} taxRate={invoice.taxRate} />
          </section>
        </div>

        <DecisionPanel invoice={invoice} result={result} />
      </div>
    </div>
  );
}