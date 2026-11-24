import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronRightIcon, InboxIcon, LockIcon, SirenIcon } from 'lucide-react';
import { useChecks, useRules } from '../lib/queries';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { IntakePanel } from '../components/IntakePanel';
import { TextField } from '../components/TextField';
import { formatCurrency, formatSignedCurrency } from '../utils/currency';
import { issueSummary } from '../utils/issueSummary';
import { ComparisonResult, DetectionRules } from '../../shared/types';

type StatusFilter = 'all' | 'frozen' | 'escalated';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'escalated', label: 'Escalated' }
];

const PENDING_VALUE = '\u2014';

function isFrozen(result: ComparisonResult, rules?: DetectionRules) {
  return rules ? rules.bankCheck && result.bankMismatch : false;
}

function isEscalated(result: ComparisonResult, rules?: DetectionRules) {
  return rules ? Math.abs(result.variance) >= rules.panicThreshold : false;
}

export function Queue() {
  const { data: rulesData, error: rulesError } = useRules();
  const { data, isLoading, error } = useChecks('held');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [department, setDepartment] = useState<string | null>(null);
  const rules = rulesData?.rules;
  const held = (data?.checks ?? [])
    .slice()
    .sort((a, b) => Math.abs(b.result.variance) - Math.abs(a.result.variance));

  const exposure = held.reduce((sum, { result }) => sum + Math.max(result.variance, 0), 0);
  const frozenCount = held.filter(({ result }) => isFrozen(result, rules)).length;
  const escalatedCount = held.filter(({ result }) => isEscalated(result, rules)).length;
  const departments = Array.from(
    new Set(held.map(({ invoice }) => invoice.department).filter(Boolean))
  ).sort();

  const query = search.trim().toLowerCase();
  const visible = held.filter(({ invoice, result }) => {
    if (status === 'frozen' && !isFrozen(result, rules)) return false;
    if (status === 'escalated' && !isEscalated(result, rules)) return false;
    if (department && invoice.department !== department) return false;
    return (
      !query ||
      [invoice.vendor, invoice.invoiceNumber, invoice.poNumber, invoice.department].some((field) =>
        (field ?? '').toLowerCase().includes(query)
      )
    );
  });

  const summaryCards = [
    {
      label: 'Total exposure at risk',
      value: isLoading ? PENDING_VALUE : formatCurrency(exposure),
      note: 'Extra billed over order, across held bills',
      icon: null,
      className: 'bg-primary-container text-on-primary-container'
    },
    {
      label: 'Frozen bills',
      value: isLoading || !rules ? PENDING_VALUE : String(frozenCount),
      note: 'Bank account differs from the one on file',
      icon: LockIcon,
      className: 'border border-outline-variant bg-surface-container-lowest text-ink'
    },
    {
      label: 'Escalated bills',
      value: isLoading || !rules ? PENDING_VALUE : String(escalatedCount),
      note: 'Over the panic threshold',
      icon: SirenIcon,
      className: 'border border-outline-variant bg-surface-container-lowest text-ink'
    }
  ];

  function clearFilters() {
    setSearch('');
    setStatus('all');
    setDepartment(null);
  }

  return (
    <div className="mx-auto max-w-[1280px]">
      <header className="mb-6">
        <h1 className="text-2xl leading-8 text-ink">Held invoices</h1>
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
      {rulesError && (
        <div className="mb-4 rounded-xl bg-blush px-5 py-4 text-sm text-on-tertiary-container">
          Detection rules failed to load. Frozen/Escalated badges may be missing.
        </div>
      )}

      <dl aria-label="Queue summary" className="mb-6 grid gap-4 sm:grid-cols-3">
        {summaryCards.map(({ label, value, note, icon: Icon, className }) => (
          <div key={label} className={`rounded-xl px-5 py-4 ${className}`}>
            <dt className="flex items-center gap-1.5 text-sm font-medium">
              {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
              {label}
            </dt>
            <dd className="mt-2 text-3xl font-medium tabular-nums">{value}</dd>
            <dd className="mt-1 text-xs opacity-80">{note}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="min-w-0 space-y-4">
          <TextField label="Search vendor, invoice or PO" value={search} onChange={setSearch} />
          <div
            role="group"
            aria-label="Filter held invoices"
            className="flex flex-wrap items-center gap-2"
          >
            {STATUS_FILTERS.map(({ value, label }) => (
              <Button
                key={value}
                variant={status === value ? 'tonal' : 'outlined'}
                aria-pressed={status === value}
                className="h-8 px-3"
                onClick={() => setStatus(value)}
              >
                {label}
              </Button>
            ))}
            {departments.length > 0 && (
              <span className="mx-1 h-5 w-px bg-outline-variant" aria-hidden="true" />
            )}
            {departments.map((name) => (
              <Button
                key={name}
                variant={department === name ? 'tonal' : 'outlined'}
                aria-pressed={department === name}
                className="h-8 px-3"
                onClick={() => setDepartment(department === name ? null : name)}
              >
                {name}
              </Button>
            ))}
          </div>

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
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <p className="text-base font-medium text-ink">No bills match</p>
              <p className="mt-1 max-w-xs text-sm text-ink-variant">
                Change the search or filters to see held bills.
              </p>
              <Button variant="outlined" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {visible.map(({ invoice, result }) => {
                const frozen = isFrozen(result, rules);
                const escalated = isEscalated(result, rules);
                return (
                  <li key={invoice.id}>
                    <Link
                      to={`/queue/${invoice.id}`}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors duration-150 ease-out hover:bg-ink/[0.04] focus-visible:bg-ink/[0.06] focus-visible:outline-none md:grid-cols-[minmax(0,1fr)_170px_130px_80px_20px]"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-medium text-ink">{invoice.vendor}</span>
                          <Chip tone="neutral">{invoice.department}</Chip>
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
        </div>

        <IntakePanel />
      </div>
    </div>
  );
}