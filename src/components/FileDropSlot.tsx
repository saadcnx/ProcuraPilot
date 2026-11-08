import React, { DragEvent, useState } from 'react';
import { FileTextIcon, UploadIcon, XIcon } from 'lucide-react';

interface FileDropSlotProps {
  label: string;
  hint: string;
  file: File | null;
  onSelect: (file: File | null) => void;
  disabled?: boolean;
}

export function FileDropSlot({ label, hint, file, onSelect, disabled }: FileDropSlotProps) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onSelect(dropped);
  };

  if (file) {
    return (
      <div className="flex h-16 items-center gap-3 rounded-lg bg-surface-container px-3">
        <FileTextIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{file.name}</p>
          <p className="text-xs text-ink-variant">
            {label} · {Math.max(1, Math.round(file.size / 1024))} KB
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          disabled={disabled}
          aria-label={`Remove ${label.toLowerCase()}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-variant transition-colors duration-150 ease-out hover:bg-ink/[0.08] disabled:opacity-40">
          
          <XIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>);

  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex h-16 cursor-pointer items-center gap-3 rounded-lg border px-3 transition-colors duration-150 ease-out focus-within:ring-2 focus-within:ring-primary ${
      dragging ? 'border-primary bg-primary/[0.08]' : 'border-outline-variant hover:bg-primary/[0.04]'}`
      }>
      
      <UploadIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="block truncate text-xs text-ink-variant">{hint}</span>
      </span>
      <input
        type="file"
        className="sr-only"
        accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx"
        disabled={disabled}
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)} />
      
    </label>);

}