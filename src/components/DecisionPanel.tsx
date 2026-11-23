import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, ShieldAlertIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../lib/api';
import { useDecide } from '../lib/queries';
import { flagMeta } from '../data/flagMeta';
import { Invoice, ComparisonResult } from '../../shared/types';
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
  const { user } = useAuth();
  const decideMutation = useDecide();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [confirmReject, setConfirmReject] = useState(false);

  const isApprover = user?.role === 'boss';
  const reasonLength = reason.trim().length;
  const reasonValid = reasonLength >= MIN_REASON;
  const pending = decideMutation.isPending;

  const handleReject = async () => {
    try {
      await decideMutation.mutateAsync({ id: invoice.id, decision: 'rejected' });
      setConfirmReject(false);
      toast.success('Invoice rejected. Recorded in audit vault.');
      navigate('/queue');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'signer_only') {
        toast.error('Only a manager can reject this invoice.');
      } else {
        toast.error('Could not reject. Try again.');
      }
    }
  };

  const handleForceApprove = async () => {
    if (!reasonValid) return;
    try {
      await decideMutation.mutateAsync({
        id: invoice.id,
        decision: 'force-approved',
        reason: reason.trim()
      });
      toast.success('Invoice approved despite errors. Override recorded.');
      navigate('/queue');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'signer_only') {
        toast.error('Only a manager can approve this.');
      } else if (err instanceof ApiError && err.code === 'already_decided') {
        toast.error('This invoice has already been decided.');
      } else {
        toast.error('Could not approve. Try again.');
      }
    }
  };

  return (
    <aside className="space-y-6 lg:sticky lg:top-10">
      
      {/* Problems Section */}
      <section className="rounded-xl border border-error/20 bg-error/[0.02] p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlertIcon className="h-5 w-5 text-error" />
          <h2 className="text-lg font-medium text-ink">
            What's wrong with this bill?
          </h2>
        </div>
        
        {result.flags.length === 0 ? (
          <p className="text-sm text-ink-variant">Everything matches. No problems found.</p>
        ) : (
          <ul className="space-y-4">
            {result.flags.map((flag, index) => {
              const Icon = flagMeta[flag.kind].icon;
              return (
                <li key={`${flag.kind}-${flag.sku ?? index}`} className="flex gap-3 bg-white p-3 rounded-lg border border-outline-variant shadow-sm">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{flagMeta[flag.kind].label}</p>
                    <p className="text-sm text-ink-variant mt-0.5">{flag.message}</p>
                  </div>
                  {Math.abs(flag.amount) >= 0.005 && (
                    <span className="shrink-0 text-sm font-bold tabular-nums text-error">
                      {formatSignedCurrency(flag.amount)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Decision Section */}
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <h2 className="text-lg font-medium text-ink mb-1">
          What do you want to do?
        </h2>
        
        {isApprover ? (
          <>
            <p className="text-sm text-ink-variant mb-6">
              Signed as <span className="font-medium text-ink">{user?.name}</span>. You can pay the invoice despite the errors, or reject it entirely.
            </p>
            
            <div className="mb-6">
              <TextField
                label="Why are you approving this?"
                multiline
                rows={3}
                value={reason}
                onChange={setReason}
                labelBg="bg-surface-container-lowest"
                helper={
                  reasonValid
                    ? `Looks good (${reasonLength} chars)`
                    : `Required to override — ${MIN_REASON - reasonLength} more characters`
                }
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                disabled={!reasonValid || pending} 
                loading={pending} 
                onClick={handleForceApprove}
                className="w-full"
              >
                Pay Anyway ({formatCurrency(result.invoiceTotal)})
              </Button>
              <Button
                variant="outlined-danger"
                disabled={pending}
                onClick={() => setConfirmReject(true)}
                className="w-full"
              >
                Reject Invoice
              </Button>
            </div>
          </>
        ) : (
          <div className="flex gap-3 text-sm text-ink-variant bg-surface-container-low p-4 rounded-lg mt-4">
            <EyeIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              You are an inspector. You can review the issues, but only a manager can approve or reject the payment.
            </p>
          </div>
        )}
      </section>

      <Dialog
        open={confirmReject}
        onClose={() => setConfirmReject(false)}
        title="Reject this bill?"
        description={
          <p>
            Invoice <span className="font-medium">{invoice.invoiceNumber}</span> from {invoice.vendor} will be cancelled. The vendor will need to send a corrected bill.
          </p>
        }
        actions={
          <>
            <Button variant="text" onClick={() => setConfirmReject(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={pending} onClick={handleReject}>
              Yes, reject it
            </Button>
          </>
        }
      />
    </aside>
  );
}