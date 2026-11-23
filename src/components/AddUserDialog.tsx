import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ApiError } from '../lib/api';
import { useInviteUser } from '../lib/queries';
import { Role } from '../../shared/types';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { TextField } from './TextField';

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
}

const roleOptions: { value: Role; label: string; description: string }[] = [
  { value: 'inspector', label: 'Inspector', description: 'Reviews mismatches. Can\u2019t release payment.' },
  { value: 'boss', label: 'Approver', description: 'Can reject bills or force approve with a reason.' }
];

interface CreatedUser {
  name: string;
  email: string;
  tempPassword: string;
}

export function AddUserDialog({ open, onClose }: AddUserDialogProps) {
  const inviteMutation = useInviteUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('inspector');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [created, setCreated] = useState<CreatedUser | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setEmail('');
      setRole('inspector');
      setErrors({});
      setCreated(null);
      setCopied(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    const next: { name?: string; email?: string } = {};
    if (!name.trim()) next.name = 'Enter a full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = 'Enter a valid work email.';
    if (next.name || next.email) {
      setErrors(next);
      return;
    }
    try {
      const res = await inviteMutation.mutateAsync({ name: name.trim(), email: email.trim(), role });
      setCreated({ name: res.user.name, email: res.user.email, tempPassword: res.tempPassword });
      toast.success(`${res.user.name} added. Share the temporary password below.`);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'email_in_use') {
        setErrors({ email: 'Someone already uses that email.' });
        return;
      }
      toast.error('Could not add person. Try again.');
    }
  };

  const handleCopy = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.tempPassword);
      setCopied(true);
    } catch {
      toast.error('Could not copy. Select the password manually.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={created ? 'Person added' : 'Add person'}
      description={
        created
          ? 'Share this temporary password with them out-of-band. It will not be shown again.'
          : "They'll sign in with this email. Every action they take is recorded under their name."
      }
      actions={
        created ? (
          <Button onClick={onClose}>Done</Button>
        ) : (
          <>
            <Button variant="text" onClick={onClose}>
              Cancel
            </Button>
            <Button loading={inviteMutation.isPending} onClick={handleSubmit}>
              Add person
            </Button>
          </>
        )
      }
    >
      {created ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-ink">{created.name}</p>
            <p className="text-sm text-ink-variant">{created.email}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-ink-variant">Temporary password</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded bg-surface-container px-3 py-2 font-mono text-sm text-ink">
                {created.tempPassword}
              </code>
              <Button variant="outlined" onClick={handleCopy}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <TextField
            label="Full name"
            value={name}
            onChange={setName}
            error={errors.name}
            labelBg="bg-surface-container-high"
            autoFocus
          />
          <TextField
            label="Work email"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            labelBg="bg-surface-container-high"
          />
          <fieldset>
            <legend className="text-sm font-medium text-ink">Authority</legend>
            <div className="mt-2 space-y-1">
              {roleOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors duration-150 ease-out hover:bg-ink/[0.04]"
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={role === option.value}
                    onChange={() => setRole(option.value)}
                    className="mt-0.5 h-5 w-5 accent-[#4A6648]"
                  />
                  <span>
                    <span className="block text-sm font-medium text-ink">{option.label}</span>
                    <span className="block text-sm text-ink-variant">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </Dialog>
  );
}