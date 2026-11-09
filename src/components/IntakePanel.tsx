import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, CircleCheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '../lib/api';
import { CheckDetail, useUploadCheck } from '../lib/queries';
import { formatSignedCurrency } from '../utils/currency';
import { issueSummary } from '../utils/issueSummary';
import { Button } from './Button';
import { FileDropSlot } from './FileDropSlot';

export function IntakePanel() {
  const uploadMutation = useUploadCheck();
  const [poFile, setPoFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [last, setLast] = useState<CheckDetail | null>(null);

  const reading = uploadMutation.isPending;

  const handleRun = async () => {
    if (!poFile || !invoiceFile) return;
    setLast(null);
    try {
      const outcome = await uploadMutation.mutateAsync({ po: poFile, invoice: invoiceFile });
      setLast(outcome);
      setPoFile(null);
      setInvoiceFile(null);
      if (outcome.result.isClean) {
        toast.success(`${outcome.invoice.vendor} matched. Cleared for payment.`);
      } else {
        toast(
          `${outcome.invoice.vendor} held — ${formatSignedCurrency(outcome.result.variance)} over order.`
        );
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === 'could_not_parse_pdf') {
        toast.error('Could not read one of the PDFs. Make sure they contain selectable text.');
      } else if (err instanceof ApiError && err.code === 'both_files_required') {
        toast.error('Attach both the purchase order and the invoice.');
      } else if (err instanceof ApiError && err.code === 'pdf_only') {
        toast.error('Only PDF files are accepted.');
      } else {
        toast.error('Upload failed. Try again.');
      }
    }
  };

  return (
    <section
      aria-labelledby="intake-title"
      className="rounded-xl bg-surface-container-low p-5 lg:sticky lg:top-10"
    >
      <h2 id="intake-title" className="text-base font-medium text-ink">
        New intake
      </h2>
      <p className="mt-1 text-sm text-ink-variant">
        Add the original order and the vendor's bill. Anything off by a cent is held.
      </p>

      <div className="mt-5 space-y-3">
        <FileDropSlot
          label="Purchase order"
          hint="PDF only"
          file={poFile}
          onSelect={setPoFile}
          disabled={reading}
        />
        <FileDropSlot
          label="Vendor invoice"
          hint="PDF only"
          file={invoiceFile}
          onSelect={setInvoiceFile}
          disabled={reading}
        />
      </div>

      <Button
        className="mt-5"
        fullWidth
        disabled={!poFile || !invoiceFile}
        loading={reading}
        onClick={handleRun}
      >
        {reading ? 'Reading documents…' : 'Run match'}
      </Button>

      <div aria-live="polite">
        {last && !last.result.isClean && (
          <Link
            to={`/queue/${last.invoice.id}`}
            className="mt-4 flex items-center gap-3 rounded-lg bg-blush p-3 text-sm text-on-tertiary-container transition-colors duration-150 ease-out hover:bg-[#F0D3DD]"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium">{last.invoice.vendor} held</p>
              <p>
                {issueSummary(last.result)} · {formatSignedCurrency(last.result.variance)}
              </p>
            </div>
            <ChevronRightIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
          </Link>
        )}
        {last && last.result.isClean && (
          <div className="mt-4 flex gap-3 rounded-lg bg-primary-container p-3 text-sm text-on-primary-container">
            <CircleCheckIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              <span className="font-medium">{last.invoice.vendor}</span> matched to the cent and was
              cleared for payment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}