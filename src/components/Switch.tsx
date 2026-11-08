import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-8 w-[52px] shrink-0 rounded-full border-2 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
      checked ? 'border-primary bg-primary' : 'border-outline bg-surface-container-high'}`
      }>
      
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-full transition-[transform,width,height,background-color] duration-150 ease-out ${
        checked ? 'h-6 w-6 translate-x-[22px] bg-on-primary' : 'h-4 w-4 translate-x-[6px] bg-outline'}`
        } />
      
    </button>);

}