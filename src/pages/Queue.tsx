import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ChevronRightIcon,
  InboxIcon,
  LockIcon,
  SearchIcon,
  SirenIcon,
  WalletIcon
} from 'lucide-react';
import { useChecks, useRules } from '../lib/queries';
import { Chip } from '../components/Chip';
import { IntakePanel } from '../components/IntakePanel';
import { formatCurrency, formatSignedCurrency } from '../utils/currency';
import { issueSummary } from '../utils/issueSummary';

type QueueFilter = 'all' | 'frozen' | 'escalated';

const FILTERS: { key: QueueFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'frozen', label: 'Frozen' },
  { key: 'escalated', label: 'Escalated' }
];

const pillBase =
  'inline-flex h-8 items-center rounded-full px-3 text-xs font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface';
const pillActive = 'bg-primary text-on-primary hover:bg-primary-hover';
const pillIdle = 'bg-surface-container-high text-ink-variant hover:bg-ink/[0.08]';

export function Queue() {
  const { data: rulesData, error: rulesError } = useRules();
  const { data, isLoading, error } = useChecks('held');
  const rules = rulesData?.rules;

  const held = useMemo(
    () =>
      (data?.checks ?? [])
        .slice()
        .sort((a, b) => Math.abs(b.result.variance) - Math.abs(a.result.variance)),
    [data]
  );

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<QueueFilter>('all');
  const [dept, setDept] = useState<string>('all');

  const stats = useMemo(() => {
    let exposure = 0;
    let frozen = 0;
    let escalated = 0;
    for (const { result } of held) {
      if (result.variance > 0) exposure += result.variance;
      if (rules && rules.bankCheck && result.bankMismatch) frozen += 1;
      if (rules && Math.abs(result.variance) >= rules.panicThreshold) escalated += 1;
    }
    return { exposure, frozen, escalated };
  }, [held, rules]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const { invoice } of held) {
      if (invoice.department) set.add(invoice.department);
    }
    return Array.from(set).sort();
  }, [held]);

  const query = search.trim().toLowerCase();
  const filtersActive = query !== '' || filter !== 'all' || dept !== 'all';

  const visible = held.filter(({ invoice, result }) => {
    if (filter === 'frozen' && (!rules || !rules.bankCheck || !result.bankMismatch)) {
      return false;
    }
    if (filter === 'escalated' && (!rules || Math.abs(result.variance) < rules.panicThreshold)) {
      return false;
    }
    if (dept !== 'all' && invoice.department !== dept) {
      return false;
    }
    if (query) {
      const hay =
        `${invoice.vendor} ${invoice.invoiceNumber} ${invoice.poNumber}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setSearch('');
    setFilter('all');
    setDept('all');
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <header className="mb-6">
        <h1 className="text-2xl leading-8 text-ink">Held invoices</h1>
        <p className="mt-1 text-sm text-ink-variant">
          {isLoading
            ? 'Loading queue\u2026'
            : held.length === 0
            ? 'Nothing is waiting. New bills appear here when they fail the match.'
            : filtersActive
            ? `${visible.length} of ${held.length} bill${held.length === 1 ? '' : 's'} shown.`
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

      <section aria-label="Exposure summary" className="mb-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-ink-variant">Total Exposure at Risk</p>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush text-on-tertiary-container">
              <WalletIcon className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-ink">
            {formatCurrency(stats.exposure)}
          </p>
          <p className="mt-1 text-xs text-ink-variant">Extra dollars held in open bills</p>
        </article>

        <article className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-ink-variant">Frozen Bills</p>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush text-on-tertiary-container">
              <LockIcon className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-ink">
            {stats.frozen}
          </p>
          <p className="mt-1 text-xs text-ink-variant">Bank account does not match on file</p>
        </article>

        <article className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-ink-variant">Escalated Bills</p>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush text-on-tertiary-container">
              <SirenIcon className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-ink">
            {stats.escalated}
          </p>
          <p className="mt-1 text-xs text-ink-variant">
            {rules
              ? `Above ${formatCurrency(rules.panicThreshold)} panic threshold`
              : 'Panic threshold pending'}
          </p>
        </article>
      </section>

      <section
        aria-label="Search and filters"
        className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="relative w-full max-w-sm">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-variant"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor, invoice, or PO"
            className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-9 pr-3 text-sm text-ink placeholder:text-ink-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`${pillBase} ${filter === f.key ? pillActive : pillIdle}`}
            >
              {f.label}
            </button>
          ))}
          {departments.length > 0 && (
            <span className="mx-1 hidden h-5 w-px bg-outline-variant sm:block" aria-hidden="true" />
          )}
          {departments.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDept(dept === d ? 'all' : d)}
              aria-pressed={dept === d}
              className={`${pillBase} ${dept === d ? pillActive : pillIdle}`}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

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
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high text-ink-variant">
                <SearchIcon className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-4 text-base font-medium text-ink">No bills match these filters</p>
              <p className="mt-1 max-w-xs text-sm text-ink-variant">
                Try a different search or reset the filters.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex h-9 items-center rounded-lg border border-outline px-4 text-sm font-medium text-primary transition-colors duration-150 ease-out hover:bg-primary/[0.08]"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {visible.map(({ invoice, result }) => {
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

        <IntakePanel />
      </div>
    </div>
  );
}