import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronRightIcon, InboxIcon, LockIcon, SirenIcon } from 'lucide-react';
import { useChecks, useRules } from '../lib/queries';
import { Chip } from '../components/Chip';
import { IntakePanel } from '../components/IntakePanel';
import { formatSignedCurrency } from '../utils/currency';
import { issueSummary } from '../utils/issueSummary';

export function Queue() {
  const { data: rulesData } = useRules();
  const { data, isLoading, error } = useChecks('held');
  const rules = rulesData?.rules;
  const held = (data?.checks ?? [])
    .slice()
    .sort((a, b) => Math.abs(b.result.variance) - Math.abs(a.result.variance));

  return (
    <div className="mx-auto max-w-[1280px]">
      <header className="mb-6">
        <h1 className="text-[28px] leading-9 text-ink">Held invoices</h1>
        <p className="mt-1 text-sm text-ink-variant">
          {isLoading
            ? 'Loading queue\u2026'
            : held.length === 0
            ? 'Nothing is waiting. New bills appear here when they fail the match.'
            : `${held.length} bill${held.length === 1 ? '' : 's'} failed the match against ${
                held.length === 1 ? 'its' : 'their'
              } purchase order. Largest overcharge first.`}
        </p>
      </header>

      {error && (
        <div className="mb-4 rounded-xl bg-blush px-5 py-4 text-sm text-on-tertiary-container">
          Could not load the queue. {error instanceof Error ? error.message : 'Refresh the page.'}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <section
          aria-label="Held invoices"
          className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest"
        >
          <div className="hidden grid-cols-[minmax(0,1fr)_170px_130px_80px_20px] gap-x-4 border-b border-outline-variant px-5 py-3 text-xs font-medium text-ink-variant md:grid">
            <span>Vendor</span>
            <span>Issue</span>
            <span className="text-right">Over order</span>
            <span className="text-right">Received</span>
            <span />
          </div>

          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-ink-variant">Loading queue\u2026</div>
          ) : held.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                <InboxIcon className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-4 text-base font-medium text-ink">Queue is clear</p>
              <p className="mt-1 max-w-xs text-sm text-ink-variant">
                Every bill received so far has matched its order or been decided.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {held.map(({ invoice, result }) => {
                const frozen = rules ? rules.bankCheck && result.bankMismatch : false;
                const escalated = rules
                  ? Math.abs(result.variance) >= rules.panicThreshold
                  : false;
                return (
                  <li key={invoice.id}>
                    <Link
                      to={`/queue/${invoice.id}`}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors duration-150 ease-out hover:bg-ink/[0.04] focus-visible:bg-ink/[0.06] focus-visible:outline-none md:grid-cols-[minmax(0,1fr)_170px_130px_80px_20px]"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-medium text-ink">{invoice.vendor}</span>
                          {frozen && (
                            <Chip tone="rose" icon={LockIcon}>
                              Frozen
                            </Chip>
                          )}
                          {escalated && (
                            <Chip tone="rose" icon={SirenIcon}>
                              Escalated
                            </Chip>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-sm text-ink-variant">
                          {invoice.invoiceNumber} · {invoice.poNumber}
                        </p>
                      </div>
                      <span className="hidden text-sm text-ink-variant md:block">
                        {issueSummary(result)}
                      </span>
                      <span className="text-right text-base font-medium tabular-nums text-ink">
                        {formatSignedCurrency(result.variance)}
                      </span>
                      <span className="hidden text-right text-sm text-ink-variant md:block">
                        {format(new Date(invoice.receivedAt), 'MMM d')}
                      </span>
                      <ChevronRightIcon
                        className="hidden h-5 w-5 text-ink-variant md:block"
                        aria-hidden="true"
                      />
                      <span className="col-span-2 text-xs text-ink-variant md:hidden">
                        {issueSummary(result)} · {format(new Date(invoice.receivedAt), 'MMM d')}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <IntakePanel />
      </div>
    </div>
  );
}