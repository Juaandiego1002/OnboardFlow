'use client';

import { useAppStore } from '@/store/useAppStore';
import { LandingPage } from '@/components/landing-page';
import { AdminLogin } from '@/components/admin-login';
import { AdminPanel } from '@/components/admin-panel';
import { CreateProcess } from '@/components/create-process';
import { ManageSteps } from '@/components/manage-steps';
import { ViewEmployees } from '@/components/view-employees';
import { EmployeeAccess } from '@/components/employee-access';
import { EmployeeOnboarding } from '@/components/employee-onboarding';
import { useEffect } from 'react';

export default function Home() {
  const { currentView, clearNotification, notification, isLoading } = useAppStore();

  // Auto-clear notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(clearNotification, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  // Render based on current view
  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'admin-login':
        return <AdminLogin />;
      case 'admin-panel':
        return <AdminPanel />;
      case 'create-process':
        return <CreateProcess />;
      case 'edit-process':
      case 'manage-steps':
        return <ManageSteps />;
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
          className={`fixed top-4 right-4 z-[100] max-w-sm rounded-lg border p-4 shadow-lg transition-all duration-300 animate-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                notification.type === 'success' ? 'bg-emerald-200' : 'bg-red-200'
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
