import React from 'react';

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 32 32" className="h-10 w-10 shrink-0 fill-primary" aria-hidden="true">
        <path d="M7 3h12l6 6v20H7z" />
        <path d="M19 3l6 6h-6z" className="fill-surface" />
        <path
          d="M11.5 18.5l3.5 3.5 6-7"
          className="stroke-surface"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round" />
        
      </svg>
      <span className="text-lg font-medium tracking-tight text-ink">
        Procura<span className="font-bold text-primary">Pilot</span>
      </span>
    </div>);

}