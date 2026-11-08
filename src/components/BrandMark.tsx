import React from 'react';

const LOGO_URL = 'https://wander-pocket-s2h8.here.now/ProcuraPilot.png';

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#E8E8E8]">
        <img
          src={LOGO_URL}
          alt=""
          className="absolute left-1/2 top-0 h-14 max-w-none -translate-x-1/2" />
        
      </div>
      <span className="text-lg font-medium tracking-tight text-ink">ProcuraPilot</span>
    </div>);

}