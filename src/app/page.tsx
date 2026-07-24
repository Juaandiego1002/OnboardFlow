'use client';

import { type AppView, useAppStore } from '@/store/useAppStore';
import { LandingPage } from '@/components/landing-page';
import { AdminLogin } from '@/components/admin-login';
import { ForgotPassword } from '@/components/forgot-password';
import { ResetPassword } from '@/components/reset-password';
import { AdminPanel } from '@/components/admin-panel';
import { CreateProcess } from '@/components/create-process';
import { ManageSteps } from '@/components/manage-steps';
import { ViewEmployees } from '@/components/view-employees';
import { ManageEmployees } from '@/components/manage-employees';
import { EmployeeAccess } from '@/components/employee-access';
import { EmployeeOnboarding } from '@/components/employee-onboarding';
import { useEffect, useState } from 'react';

export default function Home() {
  const { currentView, clearNotification, notification, isLoading, setView, setPendingEmployeeToken } = useAppStore();
  const [closing, setClosing] = useState(false);
  const [initialHashDone, setInitialHashDone] = useState(false);

  // On mount, restore view from URL hash before push effect runs
  useEffect(() => {
    if (initialHashDone) return;
    setInitialHashDone(true);

    const params = new URLSearchParams(window.location.search);
    if (params.has('token')) return;

    const hash = window.location.hash.replace('#', '');
    const validViews: AppView[] = [
      'admin-login', 'admin-panel', 'forgot-password', 'reset-password',
      'create-process', 'manage-steps', 'manage-employees',
      'view-employees', 'employee-access', 'employee-onboarding',
    ];
    if (hash && validViews.includes(hash as AppView)) {
      setView(hash as AppView);
    }
  }, [setView, initialHashDone]);

  // Listen to back/forward navigation to restore view from URL hash
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      const validViews: AppView[] = [
        'admin-login', 'admin-panel', 'forgot-password', 'reset-password',
        'create-process', 'manage-steps', 'manage-employees',
        'view-employees', 'employee-access', 'employee-onboarding',
      ];
      if (hash && validViews.includes(hash as AppView)) {
        setView(hash as AppView);
      } else {
        setView('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setView]);

  // Push currentView to URL hash (creates history entries for back/forward)
  // Only runs after initial hash is read to avoid overwriting the URL hash on refresh
  useEffect(() => {
    if (!initialHashDone) return;

    const hasToken = window.location.search.includes('token');
    if (hasToken) return;

    const currentHash = window.location.hash.replace('#', '');
    const targetHash = (currentView === 'landing' || currentView === 'employee-access') ? '' : currentView;

    if (currentHash !== targetHash) {
      if (targetHash) {
        window.history.pushState(null, '', `#${targetHash}`);
      } else if (currentHash) {
        window.history.pushState(null, '', window.location.pathname);
      }
    }
  }, [currentView, initialHashDone]);

  // Auto-clear notifications
  useEffect(() => {
    if (notification) {
      setClosing(false);
      const closeTimer = setTimeout(() => setClosing(true), 3000);
      const removeTimer = setTimeout(clearNotification, 4000);
      return () => {
        clearTimeout(closeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [notification, clearNotification]);

  // Detect ?token=xxx from URL (email link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setPendingEmployeeToken(token);
      setView('employee-access');
      window.history.replaceState(null, '', '/');
    }
  }, [setPendingEmployeeToken, setView]);

  // Render based on current view
  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'admin-login':
        return <AdminLogin />;
      case 'admin-panel':
        return <AdminPanel />;
      case 'forgot-password':
        return <ForgotPassword />;
      case 'reset-password':
        return <ResetPassword />;
      case 'create-process':
        return <CreateProcess />;
      case 'edit-process':
      case 'manage-steps':
        return <ManageSteps />;
      case 'manage-employees':
        return <ManageEmployees />;
      case 'view-employees':
        return <ViewEmployees />;
      case 'employee-access':
        return <EmployeeAccess />;
      case 'employee-onboarding':
        return <EmployeeOnboarding />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-[100] max-w-sm rounded-lg border p-4 shadow-lg transition-all duration-500 ${
            closing ? 'opacity-0 translate-y-[-8px]' : 'opacity-100 animate-in slide-in-from-top-2'
          } ${
            notification.type === 'success'
              ? 'border-amber-400/30 bg-gradient-to-b from-amber-500/10 to-amber-500/5 backdrop-blur-md text-amber-800 dark:text-amber-300 dark:border-amber-400/20'
              : 'border-red-400/30 bg-gradient-to-b from-red-500/10 to-red-500/5 backdrop-blur-md text-red-700 dark:text-red-300 dark:border-red-400/20'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                notification.type === 'success' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300' : 'bg-red-500/20 text-red-600 dark:text-red-300'
              }`}
            >
              <span className="text-xs font-bold">
                {notification.type === 'success' ? '✓' : '!'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={clearNotification}
              className="shrink-0 text-current opacity-50 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Global Loading Overlay */}
      {isLoading && currentView !== 'landing' && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-lg bg-card border px-4 py-3 shadow-lg">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            <span className="text-sm text-muted-foreground">Procesando...</span>
          </div>
        </div>
      )}

      {/* Main View */}
      {renderView()}
    </div>
  );
}
