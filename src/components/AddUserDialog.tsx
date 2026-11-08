import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useProcurement } from '../contexts/ProcurementContext';
import { Role } from '../types/procurement';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { TextField } from './TextField';

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
}

const roleOptions: {value: Role;label: string;description: string;}[] = [
{ value: 'inspector', label: 'Inspector', description: 'Reviews mismatches. Can’t release payment.' },
{ value: 'boss', label: 'Approver', description: 'Can reject bills or force approve with a reason.' }];


export function AddUserDialog({ open, onClose }: AddUserDialogProps) {
  const { addUser } = useProcurement();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('inspector');
  const [errors, setErrors] = useState<{name?: string;email?: string;}>({});

  useEffect(() => {
    if (open) {
      setName('');
      setEmail('');
      setRole('inspector');
      setErrors({});
    }
  }, [open]);

  const handleSubmit = () => {
    const next: {name?: string;email?: string;} = {};
    if (!name.trim()) next.name = 'Enter a full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid work email.';
    if (next.name || next.email) {
      setErrors(next);
      return;
    }
    const err = addUser({ name, email, role });
    if (err) {
      setErrors({ email: err });
      return;
    }
    toast.success(`${name.trim()} added as ${role === 'boss' ? 'an approver' : 'an inspector'}.`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add person"
      description="They’ll sign in with this email. Every action they take is recorded under their name."
      actions={
      <>
          <Button variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add person</Button>
        </>
      }>
      
      <div className="space-y-4">
        <TextField
          label="Full name"
          value={name}
          onChange={setName}
          error={errors.name}
          labelBg="bg-surface-container-high"
          autoFocus />
        
        <TextField
          label="Work email"
          type="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          labelBg="bg-surface-container-high" />
        
        <fieldset>
          <legend className="text-sm font-medium text-ink">Authority</legend>
          <div className="mt-2 space-y-1">
            {roleOptions.map((option) =>
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors duration-150 ease-out hover:bg-ink/[0.04]">
              
                <input
                type="radio"
                name="role"
                value={option.value}
                checked={role === option.value}
                onChange={() => setRole(option.value)}
                className="mt-0.5 h-5 w-5 accent-[#4A6648]" />
              
                <span>
                  <span className="block text-sm font-medium text-ink">{option.label}</span>
                  <span className="block text-sm text-ink-variant">{option.description}</span>
                </span>
              </label>
            )}
          </div>
        </fieldset>
      </div>
    </Dialog>);

}