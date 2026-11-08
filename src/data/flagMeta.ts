import { GhostIcon, LandmarkIcon, LucideIcon, PackageIcon, ReceiptIcon, TagIcon } from 'lucide-react';
import { FlagKind } from '../types/procurement';

export const flagMeta: Record<FlagKind, {label: string;icon: LucideIcon;}> = {
  price: { label: 'Price raised', icon: TagIcon },
  quantity: { label: 'Over-billed quantity', icon: PackageIcon },
  ghost: { label: 'Ghost item', icon: GhostIcon },
  tax: { label: 'Tax miscalculated', icon: ReceiptIcon },
  bank: { label: 'Bank account changed', icon: LandmarkIcon }
};