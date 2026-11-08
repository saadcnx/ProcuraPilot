import React, { ReactNode, useEffect, useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useRules, useSaveRules } from '../lib/queries';
import { Button } from '../components/Button';
import { Switch } from '../components/Switch';
import { TextField } from '../components/TextField';
import { DetectionRules } from '../../shared/types';

interface RulesDraft {
  toleranceAmount: string;
  tolerancePercent: string;
  bankCheck: boolean;
  panicThreshold: string;
  panicEmail: string;
  apiKey: string;
}

type DraftErrors = Partial<Record<keyof RulesDraft, string>>;

export function DetectionRulesPage() {
  const { data, isLoading } = useRules();
  const saveMutation = useSaveRules();
  const { user } = useAuth();
  const canEdit = user?.role === 'boss';
  const rules = data?.rules;

  const [draft, setDraft] = useState<RulesDraft | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (rules) setDraft(toDraft(rules));
  }, [rules]);

  if (isLoading || !rules || !draft) {
    return (
      <div className="mx-auto max-w-[960px]">
        <header className="mb-6">
          <h1 className="text-[28px] leading-9 text-ink">Detection rules</h1>
          <p className="mt-1 text-sm text-ink-variant">Loading rules\u2026</p>
        </header>
      </div>
    );
  }

  const errors = validate(draft);
  const parsed = Object.keys(errors).length === 0 ? fromDraft(draft) : null;
  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(rules));

  const update = <K extends keyof RulesDraft,>(key: K, value: RulesDraft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const handleSave = async () => {
    if (!parsed) return;
    try {
      await saveMutation.mutateAsync(parsed);
      toast.success('Detection rules saved. The queue has been re-checked.');
    } catch {
      toast.error('Could not save rules.');
    }
  };

  return (
    <div className="mx-auto max-w-[960px]">
      <header className="mb-6">
        <h1 className="text-[28px] leading-9 text-ink">Detection rules</h1>
        <p className="mt-1 text-sm text-ink-variant">
          How much the matcher forgives, and when it raises the alarm.
          {!canEdit && ' Only approvers can change these.'}
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <RuleRow
          title="Wiggle room"
          description="Small differences are ignored. A line is flagged when its extra charge exceeds the larger of these two."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Amount (USD)"
              value={draft.toleranceAmount}
              onChange={(v) => update('toleranceAmount', v)}
              inputMode="decimal"
              error={errors.toleranceAmount}
              labelBg="bg-surface-container-lowest"
              disabled={!canEdit}
            />
            <TextField
              label="Percent of line (%)"
              value={draft.tolerancePercent}
              onChange={(v) => update('tolerancePercent', v)}
              inputMode="decimal"
              error={errors.tolerancePercent}
              labelBg="bg-surface-container-lowest"
              disabled={!canEdit}
            />
          </div>
        </RuleRow>

        <RuleRow
          title="Bank account check"
          description="Freeze any bill whose bank account differs from the vendor's account on file \u2014 no human sign-off needed."
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-ink">
              {draft.bankCheck ? 'Freezing mismatched accounts' : 'Off'}
            </span>
            <Switch
              checked={draft.bankCheck}
              onChange={(v) => update('bankCheck', v)}
              label="Freeze bills with a changed bank account"
              disabled={!canEdit}
            />
          </div>
        </RuleRow>

        <RuleRow
          title="Panic trigger"
          description="When a single bill is off by more than this, email someone immediately."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Threshold (USD)"
              value={draft.panicThreshold}
              onChange={(v) => update('panicThreshold', v)}
              inputMode="decimal"
              error={errors.panicThreshold}
              labelBg="bg-surface-container-lowest"
              disabled={!canEdit}
            />
            <TextField
              label="Alert email"
              type="email"
              value={draft.panicEmail}
              onChange={(v) => update('panicEmail', v)}
              error={errors.panicEmail}
              labelBg="bg-surface-container-lowest"
              disabled={!canEdit}
            />
          </div>
        </RuleRow>

        <RuleRow
          title="AI engine key"
          description="Used to read purchase orders and invoices during intake."
          last
        >
          <TextField
            label="API key"
            type={showKey ? 'text' : 'password'}
            value={draft.apiKey}
            onChange={(v) => update('apiKey', v)}
            error={errors.apiKey}
            labelBg="bg-surface-container-lowest"
            autoComplete="off"
            disabled={!canEdit}
            trailing={
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                aria-label={showKey ? 'Hide key' : 'Show key'}
                className="flex h-12 w-12 items-center justify-center rounded-full text-ink-variant transition-colors duration-150 ease-out hover:bg-ink/[0.08]"
              >
                {showKey ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            }
          />
        </RuleRow>

        {canEdit && (
          <div className="flex flex-col gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-variant" aria-live="polite">
              {dirty && parsed
                ? 'Unsaved changes.'
                : dirty
                ? 'Fix the highlighted fields to save.'
                : 'All changes saved.'}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="text"
                disabled={!dirty}
                onClick={() => setDraft(toDraft(rules))}
              >
                Discard
              </Button>
              <Button
                disabled={!dirty || !parsed}
                loading={saveMutation.isPending}
                onClick={handleSave}
              >
                Save rules
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function RuleRow({
  title,
  description,
  children,
  last = false
}: {
  title: string;
  description: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`grid gap-4 px-6 py-6 md:grid-cols-[260px_minmax(0,1fr)] md:gap-10 ${
        last ? '' : 'border-b border-outline-variant'
      }`}
    >
      <div>
        <h2 className="text-base font-medium text-ink">{title}</h2>
        <p className="mt-1 text-sm text-ink-variant">{description}</p>
      </div>
      <div className="md:pt-1">{children}</div>
    </div>
  );
}

function toDraft(rules: DetectionRules): RulesDraft {
  return {
    toleranceAmount: String(rules.toleranceAmount),
    tolerancePercent: String(rules.tolerancePercent),
    bankCheck: rules.bankCheck,
    panicThreshold: String(rules.panicThreshold),
    panicEmail: rules.panicEmail,
    apiKey: rules.apiKey
  };
}

function fromDraft(draft: RulesDraft): DetectionRules {
  return {
    toleranceAmount: Number(draft.toleranceAmount),
    tolerancePercent: Number(draft.tolerancePercent),
    bankCheck: draft.bankCheck,
    panicThreshold: Number(draft.panicThreshold),
    panicEmail: draft.panicEmail.trim(),
    apiKey: draft.apiKey.trim()
  };
}

function validate(draft: RulesDraft): DraftErrors {
  const errors: DraftErrors = {};
  const isNonNegative = (v: string) => v.trim() !== '' && !Number.isNaN(Number(v)) && Number(v) >= 0;
  if (!isNonNegative(draft.toleranceAmount)) errors.toleranceAmount = 'Enter 0 or more.';
  if (!isNonNegative(draft.tolerancePercent)) errors.tolerancePercent = 'Enter 0 or more.';
  else if (Number(draft.tolerancePercent) > 100)
    errors.tolerancePercent = 'Can\u2019t exceed 100%.';
  if (!isNonNegative(draft.panicThreshold)) errors.panicThreshold = 'Enter 0 or more.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.panicEmail.trim()))
    errors.panicEmail = 'Enter a valid email.';
  if (!draft.apiKey.trim()) errors.apiKey = 'A key is required to read documents.';
  return errors;
}