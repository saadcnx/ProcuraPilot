import { GhostIcon, LandmarkIcon, LucideIcon, PackageIcon, ReceiptIcon, TagIcon } from 'lucide-react';
import { FlagKind } from '../../shared/types';

export const flagMeta: Record<FlagKind, {label: string;icon: LucideIcon;}> = {
  price: { label: 'Price Increased', icon: TagIcon },
  quantity: { label: 'Billed Too Many', icon: PackageIcon },
  ghost: { label: 'Item Not Ordered', icon: GhostIcon },
  tax: { label: 'Wrong Tax Amount', icon: ReceiptIcon },
  bank: { label: 'Bank Account Changed', icon: LandmarkIcon }
};