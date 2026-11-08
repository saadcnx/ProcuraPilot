import React, { createContext, ReactNode, useContext, useState } from 'react';
import { seedAuditLog } from '../data/auditLog';
import { heldInvoices, intakePool } from '../data/invoices';
import { defaultRules } from '../data/rules';
import { DEMO_PASSWORD, seedUsers } from '../data/users';
import { AuditEntry, DetectionRules, Invoice, Role, TeamUser } from '../types/procurement';
import { compareInvoice, ComparisonResult } from '../utils/compare';

export interface IntakeResult {
  invoice: Invoice;
  result: ComparisonResult;
}

interface ProcurementContextValue {
  currentUser: TeamUser | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  invoices: Invoice[];
  auditLog: AuditEntry[];
  users: TeamUser[];
  rules: DetectionRules;
  runIntake: () => IntakeResult;
  decide: (invoiceId: string, decision: 'rejected' | 'force-approved', reason?: string) => void;
  addUser: (input: {name: string;email: string;role: Role;}) => string | null;
  setUserActive: (userId: string, active: boolean) => void;
  saveRules: (rules: DetectionRules) => void;
}

const ProcurementContext = createContext<ProcurementContextValue | null>(null);

export function ProcurementProvider({ children }: {children: ReactNode;}) {
  const [users, setUsers] = useState<TeamUser[]>(seedUsers);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>(heldInvoices);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(seedAuditLog);
  const [rules, setRules] = useState<DetectionRules>(defaultRules);
  const [intakeCount, setIntakeCount] = useState(0);

  const currentUser = users.find((u) => u.id === currentUserId) ?? null;

  const login = (email: string, password: string): string | null => {
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return 'No account uses that email.';
    if (!user.active) return 'Access to this account has been revoked. Ask an approver to restore it.';
    if (password !== DEMO_PASSWORD) return 'Incorrect password.';
    setCurrentUserId(user.id);
    return null;
  };

  const logout = () => setCurrentUserId(null);

  const runIntake = (): IntakeResult => {
    const base = intakePool[intakeCount % intakePool.length];
    const invoice: Invoice = {
      ...base,
      id: `${base.id}-${intakeCount + 1}`,
      receivedAt: new Date().toISOString()
    };
    const result = compareInvoice(invoice, rules);
    setIntakeCount((c) => c + 1);

    if (result.isClean) {
      invoice.status = 'approved';
      setAuditLog((prev) => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        vendor: invoice.vendor,
        variance: result.variance,
        flagCount: 0,
        decision: 'approved',
        actor: 'Auto-match',
        actorRole: 'system'
      },
      ...prev]
      );
    }
    setInvoices((prev) => [invoice, ...prev]);
    return { invoice, result };
  };

  const decide = (invoiceId: string, decision: 'rejected' | 'force-approved', reason?: string) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice || !currentUser) return;
    const result = compareInvoice(invoice, rules);

    setInvoices((prev) =>
    prev.map((i) =>
    i.id === invoiceId ? { ...i, status: decision === 'rejected' ? 'rejected' : 'approved' } : i
    )
    );
    setAuditLog((prev) => [
    {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      vendor: invoice.vendor,
      variance: result.variance,
      flagCount: result.flags.length,
      decision,
      actor: currentUser.name,
      actorRole: currentUser.role,
      reason
    },
    ...prev]
    );
    if (decision === 'force-approved') {
      setUsers((prev) =>
      prev.map((u) => u.id === currentUser.id ? { ...u, forceApprovals: u.forceApprovals + 1 } : u)
      );
    }
  };

  const addUser = (input: {name: string;email: string;role: Role;}): string | null => {
    const email = input.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === email)) return 'Someone already uses that email.';
    setUsers((prev) => [
    ...prev,
    { id: `u${Date.now()}`, name: input.name.trim(), email, role: input.role, active: true, forceApprovals: 0 }]
    );
    return null;
  };

  const setUserActive = (userId: string, active: boolean) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, active } : u));
  };

  return (
    <ProcurementContext.Provider
      value={{
        currentUser,
        login,
        logout,
        invoices,
        auditLog,
        users,
        rules,
        runIntake,
        decide,
        addUser,
        setUserActive,
        saveRules: setRules
      }}>
      
      {children}
    </ProcurementContext.Provider>);

}

export function useProcurement(): ProcurementContextValue {
  const ctx = useContext(ProcurementContext);
  if (!ctx) throw new Error('useProcurement must be used inside ProcurementProvider');
  return ctx;
}