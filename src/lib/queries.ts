import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DetectionRules } from '../../shared/types';
import { api, CheckDetail } from './api';

export type { CheckDetail };

export function useChecks(status?: 'held' | 'approved' | 'rejected') {
  return useQuery({
    queryKey: ['checks', status ?? 'all'],
    queryFn: () => api.getChecks(status)
  });
}

export function useCheck(id: string | undefined) {
  return useQuery({
    queryKey: ['check', id],
    queryFn: () => api.getCheck(id as string),
    enabled: !!id
  });
}

export function useUploadCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ po, invoice }: { po: File; invoice: File }) =>
      api.uploadCheck(po, invoice),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checks'] });
      qc.invalidateQueries({ queryKey: ['audit'] });
    }
  });
}

export function useDecide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      decision,
      reason
    }: {
      id: string;
      decision: 'rejected' | 'force-approved';
      reason?: string;
    }) => api.decide(id, decision, reason),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['checks'] });
      qc.invalidateQueries({ queryKey: ['check', vars.id] });
      qc.invalidateQueries({ queryKey: ['audit'] });
    }
  });
}

export function useAudit() {
  return useQuery({ queryKey: ['audit'], queryFn: api.getAudit });
}

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: api.getUsers });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.inviteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  });
}

export function usePatchUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.patchUser(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  });
}

export function useRules() {
  return useQuery({ queryKey: ['rules'], queryFn: api.getRules });
}

export function useSaveRules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rules: DetectionRules) => api.putRules(rules),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rules'] });
      qc.invalidateQueries({ queryKey: ['checks'] });
    }
  });
}