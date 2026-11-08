import { ArchiveIcon, InboxIcon, LucideIcon, SlidersHorizontalIcon, UsersIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
{ to: '/queue', label: 'Queue', icon: InboxIcon },
{ to: '/audit', label: 'Audit vault', icon: ArchiveIcon },
{ to: '/people', label: 'People', icon: UsersIcon },
{ to: '/rules', label: 'Rules', icon: SlidersHorizontalIcon }];