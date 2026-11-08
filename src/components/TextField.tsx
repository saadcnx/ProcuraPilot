import React, { ReactNode, useId } from 'react';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string | null;
  helper?: ReactNode;
  multiline?: boolean;
  rows?: number;
  trailing?: ReactNode;
  labelBg?: string;
  disabled?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoFocus?: boolean;
}

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  error,
  helper,
  multiline = false,
  rows = 3,
  trailing,
  labelBg = 'bg-surface',
  disabled,
  autoComplete,
  inputMode,
  autoFocus
}: TextFieldProps) {
  const id = useId();
  const helperId = `${id}-helper`;
  const hasError = Boolean(error);
  const supporting = error || helper;

  const fieldClass = `peer w-full rounded-[4px] border bg-transparent px-4 text-base text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
  hasError ?
  'border-error focus:shadow-[inset_0_0_0_1px_#A3324F]' :
  'border-outline hover:border-ink focus:border-primary focus:shadow-[inset_0_0_0_1px_#4A6648] disabled:hover:border-outline'} ${
  trailing ? 'pr-14' : ''}`;

  const labelClass = `pointer-events-none absolute left-3 top-4 origin-left px-1 text-base leading-6 transition-[transform,color] duration-150 ease-out ${labelBg} ${
  hasError ? 'text-error' : 'text-ink-variant peer-focus:text-primary'} peer-focus:-translate-y-7 peer-focus:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:scale-75`;


  const shared = {
    id,
    value,
    disabled,
    placeholder: ' ',
    'aria-invalid': hasError || undefined,
    'aria-describedby': supporting ? helperId : undefined
  };

  return (
    <div>
      <div className="relative">
        {multiline ?
        <textarea
          {...shared}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} resize-none py-4 leading-6`} /> :


        <input
          {...shared}
          type={type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} h-14`} />

        }
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        {trailing && <div className="absolute right-1 top-1">{trailing}</div>}
      </div>
      {supporting &&
      <p id={helperId} className={`mt-1 px-4 text-xs leading-4 ${hasError ? 'text-error' : 'text-ink-variant'}`}>
          {supporting}
        </p>
      }
    </div>);

}