import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RequireAuth } from './components/RequireAuth';
import { Login } from './pages/Login';
import { Queue } from './pages/Queue';
import { Inspection } from './pages/Inspection';
import { AuditVault } from './pages/AuditVault';
import { People } from './pages/People';
import { DetectionRulesPage } from './pages/DetectionRules';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000
    }
  }
});

export function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<RequireAuth />}>
                  <Route path="/queue" element={<Queue />} />
                  <Route path="/queue/:invoiceId" element={<Inspection />} />
                  <Route path="/audit" element={<AuditVault />} />
                  <Route path="/people" element={<People />} />
                  <Route path="/rules" element={<DetectionRulesPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/queue" replace />} />
              </Routes>
            </BrowserRouter>
            <Toaster
              position="bottom-center"
              offset={96}
              toastOptions={{
                style: {
                  background: '#2F362E',
                  color: '#F3F0E6',
                  border: 'none',
                  borderRadius: '4px',
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '14px'
                }
              }}
            />
          </AuthProvider>
        </QueryClientProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}