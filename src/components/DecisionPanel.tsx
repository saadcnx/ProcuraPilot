import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useProcurement } from '../contexts/ProcurementContext';
import { flagMeta } from '../data/flagMeta';
import { Invoice } from '../../shared/types';
import { ComparisonResult } from '../utils/compare';
import { formatCurrency, formatSignedCurrency } from '../utils/currency';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { TextField } from './TextField';

const MIN_REASON = 20;

interface DecisionPanelProps {
  invoice: Invoice;
  result: ComparisonResult;
}

export function DecisionPanel({ invoice, result }: DecisionPanelProps) {
  const { currentUser, decide } = useProcurement();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [confirmReject, setConfirmReject] = useState(false);

  const isApprover = currentUser?.role === 'boss';
  const reasonLength = reason.trim().length;
  const reasonValid = reasonLength >= MIN_REASON;

  const handleReject = () => {
    decide(invoice.id, 'rejected');
    setConfirmReject(false);
    toast.success(`Rejected. Dispute report sent to ${invoice.vendor}.`);
    navigate('/queue');
  };

  const handleForceApprove = () => {
    if (!reasonValid) return;
    decide(invoice.id, 'force-approved', reason.trim());
    toast.success(`${formatCurrency(result.invoiceTotal)} released. Override recorded in the audit vault.`);
    navigate('/queue');
  };

  return (
    <aside className="space-y-4 lg:sticky lg:top-10">
      <section aria-labelledby="caught-title" className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 id="caught-title" className="text-base font-medium text-ink">
          What the matcher caught
        </h2>
        {result.flags.length === 0 ?
        <p className="mt-3 text-sm text-ink-variant">No mismatches under the current rules.</p> :

        <ul className="mt-4 space-y-4">
            {result.flags.map((flag, index) => {
            const Icon = flagMeta[flag.kind].icon;
            return (
              <li key={`${flag.kind}-${flag.sku ?? index}`} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blush text-on-tertiary-container">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{flagMeta[flag.kind].label}</p>
                    <p className="text-sm text-ink-variant">{flag.message}</p>
                  </div>
                  {Math.abs(flag.amount) >= 0.005 &&
                <span className="shrink-0 text-sm font-medium tabular-nums text-on-tertiary-container">
                      {formatSignedCurrency(flag.amount)}
                    </span>
                }
                </li>);

          })}
          </ul>
        }
      </section>

      <section aria-labelledby="decision-title" className="rounded-xl bg-surface-container p-5">
        <h2 id="decision-title" className="text-base font-medium text-ink">
          Decision
        </h2>
        {isApprover ?
        <>
            <p className="mt-1 text-sm text-ink-variant">
              Signed as {currentUser?.name}. Decisions can’t be edited afterwards.
            </p>
            <div className="mt-5">
              <TextField
              label="Reason for override"
              multiline
              rows={4}
              value={reason}
              onChange={setReason}
              labelBg="bg-surface-container"
              helper={
              reasonValid ?
              `${reasonLength} characters` :
              `Required to force approve — ${MIN_REASON - reasonLength} more characters`
              } />
            
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Button disabled={!reasonValid} onClick={handleForceApprove}>
                Force approve {formatCurrency(result.invoiceTotal)}
              </Button>
              <Button variant="outlined-danger" onClick={() => setConfirmReject(true)}>
                Reject and dispute
              </Button>
            </div>
          </> :

        <div className="mt-3 flex gap-3 text-sm text-ink-variant">
            <EyeIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              You’re signed in as an inspector. You can review every mismatch, but only an approver can reject this
              bill or release payment.
            </p>
          </div>
        }
      </section>

      <Dialog
        open={confirmReject}
        onClose={() => setConfirmReject(false)}
        title="Reject this bill?"
        description={
        <p>
            {invoice.invoiceNumber} from {invoice.vendor} will be cancelled and a dispute report listing{' '}
            {result.flags.length} issue{result.flags.length === 1 ? '' : 's'} will be sent to the vendor.
          </p>
        }
        actions={
        <>
            <Button variant="text" onClick={() => setConfirmReject(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject}>
              Reject and send report
            </Button>
          </>
        } />
      
    </aside>);

}