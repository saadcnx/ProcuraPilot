
```tsx
import React, { useMemo, useState } from 'react';
import { UserPlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { usePatchUser, useUsers } from '../lib/queries';
import { AddUserDialog } from '../components/AddUserDialog';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { Dialog } from '../components/Dialog';
import { TeamUser } from '../../shared/types';

const HIGH_OVERRIDES = 5;

export function People() {
  const { data, isLoading, error } = useUsers();
  const { user: currentUser } = useAuth();
  const patchMutation = usePatchUser();
  const [adding, setAdding] = useState(false);
  const [revoking, setRevoking] = useState<TeamUser | null>(null);
  const canManage = currentUser?.role === 'boss';
  const users = data?.users ?? [];

  const sorted = useMemo(
    () =>
      [...users].sort(
        (a, b) => Number(b.active) - Number(a.active) || b.forceApprovals - a.forceApprovals
      ),
    [users]
  );

  const confirmRevoke = () => {
    if (!revoking) return;
    const target = revoking;
    patchMutation.mutate(
      { id: target.id, active: false },
      {
        onSuccess: () => {
          toast.success(`${target.name} can no longer sign in.`);
          setRevoking(null);
        },
        onError: () => toast.error('Could not revoke access.')
      }
    );
  };

  const restore = (user: TeamUser) => {
    patchMutation.mutate(
      { id: user.id, active: true },
      {
        onSuccess: () => toast.success(`${user.name}'s access restored.`),
        onError: () => toast.error('Could not restore access.')
      }
    );
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-9 text-ink">People & authority</h1>
          <p className="mt-1 text-sm text-ink-variant">
            Who can release money, and how often they've overridden the matcher.
          </p>
        </div>
        {canManage && (
          <Button icon={UserPlusIcon} onClick={() => setAdding(true)}>
            Add person
          </Button>
        )}
      </header>

      {error && (
        <div className="mb-4 rounded-xl bg-blush px-5 py-4 text-sm text-on-tertiary-container">
          Could not load people. Refresh the page.
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div
          className={`hidden gap-x-4 border-b border-outline-variant px-5 py-3 text-xs font-medium text-ink-variant md:grid ${
            canManage
              ? 'md:grid-cols-[minmax(0,1fr)_200px_140px_150px]'
              : 'md:grid-cols-[minmax(0,1fr)_200px_140px]'
          }`}
        >
          <span>Person</span>
          <span>Authority</span>
          <span className="text-right">Force approvals</span>
          {canManage && <span className="text-right">Access</span>}
        </div>
        {isLoading ? (
          <div className="px-6 py-16 text-center text-sm text-ink-variant">Loading people\u2026</div>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {sorted.map((user) => {
              const isSelf = user.id === currentUser?.id;
              const high = user.forceApprovals >= HIGH_OVERRIDES;
              return (
                <li
                  key={user.id}
                  className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-4 ${
                    canManage
                      ? 'md:grid-cols-[minmax(0,1fr)_200px_140px_150px]'
                      : 'md:grid-cols-[minmax(0,1fr)_200px_140px]'
                  } ${user.active ? '' : 'opacity-60'}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-sm font-medium text-on-secondary-container">
                      {user.name
                        .split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
                        <span className="truncate">{user.name}</span>
                        {isSelf && <span className="text-xs font-normal text-ink-variant">(you)</span>}
                        {!user.active && <Chip>Revoked</Chip>}
                      </p>
                      <p className="truncate text-sm text-ink-variant">{user.email}</p>
                    </div>
                  </div>

                  <div className="col-start-1 row-start-2 text-sm md:col-start-auto md:row-start-auto">
                    <p className="text-ink">{user.role === 'boss' ? 'Approver' : 'Inspector'}</p>
                    <p className="text-xs text-ink-variant">
                      {user.role === 'boss' ? 'Can release payment' : 'Review only'}
                    </p>
                  </div>

                  <div className="col-start-2 row-span-2 row-start-1 text-right md:col-start-auto md:row-span-1 md:row-start-auto">
                    {user.role === 'boss' ? (
                      <>
                        <p
                          className={`text-2xl tabular-nums ${
                            high ? 'font-medium text-on-tertiary-container' : 'text-ink'
                          }`}
                        >
                          {user.forceApprovals}
                        </p>
                        {high && (
                          <p className="text-xs text-on-tertiary-container">Above team norm</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-ink-variant">No authority</p>
                    )}
                  </div>

                  {canManage && (
                    <div className="col-span-2 flex justify-end md:col-span-1">
                      {user.active ? (
                        <Button
                          variant="text"
                          className="text-error hover:bg-error/[0.08]"
                          disabled={isSelf || patchMutation.isPending}
                          title={isSelf ? 'You can\u2019t revoke your own access' : undefined}
                          onClick={() => setRevoking(user)}
                        >
                          Revoke access
                        </Button>
                      ) : (
                        <Button
                          variant="text"
                          disabled={patchMutation.isPending}
                          onClick={() => restore(user)}
                        >
                          Restore access
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <AddUserDialog open={adding} onClose={() => setAdding(false)} />
      <Dialog
        open={revoking !== null}
        onClose={() => setRevoking(null)}
        title="Revoke access?"
        description={
          <p>
            {revoking?.name} will be signed out and blocked from signing in immediately. Their past
            decisions stay in the audit vault.
          </p>
        }
        actions={
          <>
            <Button variant="text" onClick={() => setRevoking(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={patchMutation.isPending}
              onClick={confirmRevoke}
            >
              Revoke access
            </Button>
          </>
        }
      />
    </div>
  );
}