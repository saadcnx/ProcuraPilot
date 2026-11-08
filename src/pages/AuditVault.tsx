import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { CheckIcon, DownloadIcon, LockIcon, SearchIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useProcurement } from '../contexts/ProcurementContext';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { AuditEntry, Decision } from '../../shared/types';
import { formatSignedCurrency } from '../utils/currency';
import { downloadCsv, toCsv } from '../utils/csv';

type Filter = 'all' | Decision;

const filters: {value: Filter;label: string;}[] = [
{ value: 'all', label: 'All' },
{ value: 'force-approved', label: 'Force approved' },
{ value: 'rejected', label: 'Rejected' },
{ value: 'approved', label: 'Matched' }];


const decisionLabel: Record<Decision, string> = {
  'force-approved': 'Force approved',
  rejected: 'Rejected',
  approved: 'Matched'
};

export function AuditVault() {
  const { auditLog } = useProcurement();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return auditLog.filter(
      (e) =>
      (filter === 'all' || e.decision === filter) && (
      q === '' || [e.vendor, e.invoiceNumber, e.actor, e.reason ?? ''].join(' ').toLowerCase().includes(q))
    );
  }, [auditLog, filter, query]);

  const handleExport = () => {
    const rows = [
    ['Timestamp', 'Invoice', 'Vendor', 'Variance (USD)', 'Flags', 'Decision', 'Decided by', 'Role', 'Reason'],
    ...filtered.map((e) => [
    format(new Date(e.timestamp), 'yyyy-MM-dd HH:mm:ss'),
    e.invoiceNumber,
    e.vendor,
    e.variance.toFixed(2),
    String(e.flagCount),
    decisionLabel[e.decision],
    e.actor,
    e.actorRole === 'boss' ? 'Approver' : e.actorRole === 'inspector' ? 'Inspector' : 'System',
    e.reason ?? '']
    )];

    downloadCsv(`procurapilot-audit-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`, toCsv(rows));
    toast.success(`Exported ${filtered.length} entr${filtered.length === 1 ? 'y' : 'ies'}.`);
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-9 text-ink">Audit vault</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-variant">
            <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Append-only. Entries can’t be edited or deleted by anyone.
          </p>
        </div>
        <Button icon={DownloadIcon} onClick={handleExport} disabled={filtered.length === 0}>
          Download evidence
        </Button>
      </header>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="flex h-12 w-full items-center gap-3 rounded-full bg-surface-container-high px-4 focus-within:ring-2 focus-within:ring-primary md:max-w-sm">
          <SearchIcon className="h-5 w-5 shrink-0 text-ink-variant" aria-hidden="true" />
          <span className="sr-only">Search audit entries</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vendor, invoice, person, reason"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-variant" />
          
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by decision">
          {filters.map((f) => {
            const selected = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(f.value)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                selected ?
                'bg-secondary-container text-on-secondary-container' :
                'border border-outline-variant text-ink-variant hover:bg-ink/[0.06]'}`
                }>
                
                {selected && <CheckIcon className="h-4 w-4" aria-hidden="true" />}
                {f.label}
              </button>);

          })}
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        {filtered.length === 0 ?
        <p className="px-6 py-16 text-center text-sm text-ink-variant">No entries match these filters.</p> :

        <>
            <table className="hidden w-full text-sm md:table">
              <thead>
                <tr className="border-b border-outline-variant text-left text-xs text-ink-variant">
                  <th scope="col" className="py-3 pl-5 pr-3 font-medium">Time</th>
                  <th scope="col" className="px-3 py-3 font-medium">Invoice</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Over order</th>
                  <th scope="col" className="px-3 py-3 font-medium">Decision</th>
                  <th scope="col" className="px-3 py-3 font-medium">Decided by</th>
                  <th scope="col" className="py-3 pl-3 pr-5 font-medium">Reason given</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/70">
                {filtered.map((entry) =>
              <tr key={entry.id} className="align-top">
                    <td className="whitespace-nowrap py-4 pl-5 pr-3 tabular-nums text-ink-variant">
                      <p className="text-ink">{format(new Date(entry.timestamp), 'MMM d, yyyy')}</p>
                      <p className="text-xs">{format(new Date(entry.timestamp), 'HH:mm:ss')}</p>
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-medium text-ink">{entry.vendor}</p>
                      <p className="text-xs text-ink-variant">{entry.invoiceNumber}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right tabular-nums text-ink">
                      {formatSignedCurrency(entry.variance)}
                    </td>
                    <td className="px-3 py-4">
                      <DecisionChip decision={entry.decision} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-ink">
                      {entry.actor}
                      <p className="text-xs text-ink-variant">{roleText(entry)}</p>
                    </td>
                    <td className="max-w-sm py-4 pl-3 pr-5 text-ink-variant">{entry.reason ?? '—'}</td>
                  </tr>
              )}
              </tbody>
            </table>

            <ul className="divide-y divide-outline-variant md:hidden">
              {filtered.map((entry) =>
            <li key={entry.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{entry.vendor}</p>
                      <p className="text-xs tabular-nums text-ink-variant">
                        {entry.invoiceNumber} · {format(new Date(entry.timestamp), 'MMM d, HH:mm:ss')}
                      </p>
                    </div>
                    <span className="shrink-0 tabular-nums text-ink">{formatSignedCurrency(entry.variance)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-variant">
                    <DecisionChip decision={entry.decision} />
                    <span>by {entry.actor}</span>
                  </div>
                  {entry.reason && <p className="mt-2 text-sm text-ink-variant">“{entry.reason}”</p>}
                </li>
            )}
            </ul>
          </>
        }
      </section>
    </div>);

}

function DecisionChip({ decision }: {decision: Decision;}) {
  const tone = decision === 'force-approved' ? 'rose' : decision === 'approved' ? 'sage' : 'neutral';
  return <Chip tone={tone}>{decisionLabel[decision]}</Chip>;
}

function roleText(entry: AuditEntry): string {
  if (entry.actorRole === 'system') return 'Automatic';
  return entry.actorRole === 'boss' ? 'Approver' : 'Inspector';
}