import React from 'react';
import { Navigate } from 'react-router-dom';
import { useProcurement } from '../contexts/ProcurementContext';
import { AppShell } from './AppShell';

export function RequireAuth() {
  const { currentUser } = useProcurement();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <AppShell />;
}