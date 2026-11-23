import React, { useState } from 'react';
import { toast } from 'sonner';
import { useManualCheck } from '../lib/queries';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { TextField } from './TextField';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

function parseLines(input: string) {
  return input.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
    const parts = line.split(',');
    return {
      sku: parts[0]?.trim() || 'SKU-UNK',
      description: parts[1]?.trim() || 'Unknown item',
      qty: Number(parts[2]) || 1,
      unitPrice: Number(parts[3]) || 0,
    };
  });
}

export function ManualEntryDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
  const mutation = useManualCheck();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [vendor, setVendor] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [taxCharged, setTaxCharged] = useState('0');
  const [poLines, setPoLines] = useState('');
  const [invoiceLines, setInvoiceLines] = useState('');

  const handleSubmit = async () => {
    if (!vendor || !poNumber || !invoiceNumber) {
      toast.error('Vendor, PO Number, and Invoice Number are required.');
      return;
    }
    try {
      const data = {
        vendor: vendor.trim(),
        poNumber: poNumber.trim(),
        invoiceNumber: invoiceNumber.trim(),
        bankAccount: bankAccount.trim(),
        taxRate: Number(taxRate) / 100 || 0,
        invoiceTaxCharged: Number(taxCharged) || 0,
        poLines: parseLines(poLines),
        invoiceLines: parseLines(invoiceLines),
      };
      const res = await mutation.mutateAsync(data);
      toast.success('Manual invoice created.');
      qc.invalidateQueries({ queryKey: ['checks'] });
      onClose();
      navigate(`/queue/${res.invoice.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create manual entry.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Manual invoice entry"
      description="Use this if the AI cannot read the document. Paste line items as: SKU, Description, Qty, Unit Price"
      actions={
        <>
          <Button variant="text" onClick={onClose}>Cancel</Button>
          <Button loading={mutation.isPending} onClick={handleSubmit}>Create invoice</Button>
        </>
      }
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Vendor" value={vendor} onChange={setVendor} labelBg="bg-surface-container-high" />
          <TextField label="Bank Account" value={bankAccount} onChange={setBankAccount} labelBg="bg-surface-container-high" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField label="PO Number" value={poNumber} onChange={setPoNumber} labelBg="bg-surface-container-high" />
          <TextField label="Invoice Number" value={invoiceNumber} onChange={setInvoiceNumber} labelBg="bg-surface-container-high" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Tax Rate (%)" value={taxRate} onChange={setTaxRate} labelBg="bg-surface-container-high" inputMode="decimal" />
          <TextField label="Tax Charged ($)" value={taxCharged} onChange={setTaxCharged} labelBg="bg-surface-container-high" inputMode="decimal" />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">PO Line Items</label>
          <textarea
            className="w-full h-24 rounded border border-outline bg-transparent p-2 text-sm text-ink outline-none focus:border-primary"
            placeholder="SKU1, Steel Bracket, 100, 3.50&#10;SKU2, Bolts, 50, 1.20"
            value={poLines}
            onChange={(e) => setPoLines(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Invoice Line Items</label>
          <textarea
            className="w-full h-24 rounded border border-outline bg-transparent p-2 text-sm text-ink outline-none focus:border-primary"
            placeholder="SKU1, Steel Bracket, 100, 3.50&#10;SKU2, Bolts, 50, 1.20"
            value={invoiceLines}
            onChange={(e) => setInvoiceLines(e.target.value)}
          />
        </div>
      </div>
    </Dialog>
  );
}