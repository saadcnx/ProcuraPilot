import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LogOutIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useChecks } from '../lib/queries';
import { navItems } from '../data/navigation';
import { BrandMark } from './BrandMark';

export function AppShell() {
  const { user: currentUser, logout } = useAuth();
  const { data: heldChecks } = useChecks('held');
  const heldCount = heldChecks?.checks.length ?? 0;
  if (!currentUser) return null;

  const initials = currentUser.name.
  split(' ').
  map((p) => p[0]).
  join('').
  slice(0, 2);
  const roleLabel = currentUser.role === 'boss' ? 'Approver' : 'Inspector';

  return (
    <div className="flex min-h-screen w-full bg-surface text-ink">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col bg-surface-container-low px-3 py-5 lg:flex">
        <div className="px-4 pb-8">
          <BrandMark />
        </div>
        <nav aria-label="Primary" className="flex flex-col gap-1">
          {navItems.map((item) =>
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
            `flex h-14 items-center gap-3 rounded-full pl-4 pr-6 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            isActive ?
            'bg-primary-container text-on-primary-container' :
            'text-ink-variant hover:bg-ink/[0.06] hover:text-ink'}`

            }>
            
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {item.to === '/queue' && heldCount > 0 &&
            <span className="text-xs tabular-nums" aria-label={`${heldCount} held`}>
                  {heldCount}
                </span>
            }
            </NavLink>
          )}
        </nav>

        <div className="mt-auto flex items-center gap-3 rounded-2xl px-3 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush text-sm font-medium text-on-tertiary-container">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{currentUser.name}</p>
            <p className="text-xs text-ink-variant">{roleLabel}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-variant transition-colors duration-150 ease-out hover:bg-ink/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            
            <LogOutIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-surface px-4 lg:hidden">
          <BrandMark />
          <button
            type="button"
            onClick={logout}
            aria-label={`Sign out ${currentUser.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blush text-sm font-medium text-on-tertiary-container">
            
            {initials}
          </button>
        </header>
        <main className="flex-1 px-4 pb-28 pt-4 md:px-8 lg:pb-12 lg:pt-10">
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 grid h-20 grid-cols-4 bg-surface-container lg:hidden">
        
        {navItems.map((item) =>
        <NavLink key={item.to} to={item.to} className="group flex flex-col items-center justify-center gap-1">
            {({ isActive }) =>
          <>
                <span
              className={`flex h-8 w-16 items-center justify-center rounded-full transition-colors duration-150 ease-out ${
              isActive ? 'bg-primary-container text-on-primary-container' : 'text-ink-variant'}`
              }>
              
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className={`text-xs font-medium ${isActive ? 'text-ink' : 'text-ink-variant'}`}>
                  {item.label}
                </span>
              </>
          }
          </NavLink>
        )}
      </nav>
    </div>);

}