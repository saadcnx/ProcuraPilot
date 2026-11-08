import React, { ReactNode } from "react";
import { BoxIcon } from "lucide-react";
type ChipTone = 'rose' | 'sage' | 'neutral';
interface ChipProps {
  tone?: ChipTone;
  icon?: BoxIcon;
  children: ReactNode;
}
const toneClasses: Record<ChipTone, string> = {
  rose: 'bg-blush text-on-tertiary-container',
  sage: 'bg-primary-container text-on-primary-container',
  neutral: 'bg-surface-container-high text-ink-variant'
};
export function Chip({
  tone = 'neutral',
  icon: Icon,
  children
}: ChipProps) {
  return <span className={`inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 text-xs font-medium ${toneClasses[tone]}`}>
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </span>;
}