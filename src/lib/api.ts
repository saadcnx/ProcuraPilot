import { getToken } from './storage';
import {
  AuditEntry,
  ComparisonResult,
  DetectionRules,
  Invoice,
  TeamUser
} from '../../shared/types';

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  (import.meta.env.DEV ? 'http://localhost:3001' : '');

export class ApiError extends Error {
  status: number;
  code: string;
  body: any;
  constructor(status: number, code: string, body?: any) {
    super(code);
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

let onUnauthorized: () => void = () => {};
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (res.status === 401) {
    onUnauthorized();
    throw new ApiError(401, 'unauthenticated');
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, body.error ?? 'request_failed', body);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface CheckDetail {
  invoice: Invoice;
  result: ComparisonResult;
}

export const api = {
  getChecks: (status?: 'held' | 'approved' | 'rejected') =>
    apiFetch<{ checks: CheckDetail[] }>(
      `/api/checks${status ? `?status=${status}` : ''}`
    ),

  getCheck: (id: string) => apiFetch<CheckDetail>(`/api/checks/${id}`),

  uploadCheck: (po: File, invoice: File) => {
    const fd = new FormData();
    fd.append('po_file', po);
    fd.append('invoice_file', invoice);
    return apiFetch<CheckDetail>('/api/checks', { method: 'POST', body: fd });
  },

  decide: (id: string, decision: 'rejected' | 'force-approved', reason?: string) =>
    apiFetch<{ ok: boolean }>(`/api/checks/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision, reason })
    }),

  getAudit: () => apiFetch<{ entries: AuditEntry[] }>('/api/audit'),

  getUsers: () => apiFetch<{ users: TeamUser[] }>('/api/users'),

  inviteUser: (input: { name: string; email: string; role: 'inspector' | 'boss' }) =>
    apiFetch<{ user: TeamUser }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(input)
    }),

  patchUser: (id: string, active: boolean) =>
    apiFetch<{ user: TeamUser }>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active })
    }),

  getRules: () => apiFetch<{ rules: DetectionRules }>('/api/rules'),

  putRules: (rules: DetectionRules) =>
    apiFetch<{ rules: DetectionRules }>('/api/rules', {
      method: 'PUT',
      body: JSON.stringify(rules)
    })
};

export async function exportAuditCsv(): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/audit/export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (res.status === 401) {
    onUnauthorized();
    throw new ApiError(401, 'unauthenticated');
  }
  if (!res.ok) throw new ApiError(res.status, 'export_failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `procurapilot-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}