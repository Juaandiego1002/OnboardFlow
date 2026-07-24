'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';

const TAB_SESSION_KEY = 'ob-tab-session';

export function useSessionManager() {
  const { admin, logout } = useAppStore();
  const adminRef = useRef(admin);

  useEffect(() => {
    adminRef.current = admin;
  }, [admin]);

  useEffect(() => {
    if (!admin) return;

    const tabSession = sessionStorage.getItem(TAB_SESSION_KEY);
    const navEntries = performance.getEntriesByType('navigation');
    const navType = navEntries.length > 0 ? (navEntries[0] as PerformanceNavigationTiming).type : 'navigate';

    if (tabSession === 'alive' && navType === 'reload') {
      fetch('/api/auth/cancel-close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: admin.id }),
      }).catch(() => {});
    }

    sessionStorage.setItem(TAB_SESSION_KEY, 'alive');

    const handleBeforeUnload = () => {
      const currentAdmin = adminRef.current;
      if (!currentAdmin) return;

      navigator.sendBeacon('/api/auth/tab-closed', JSON.stringify({
        adminId: currentAdmin.id,
      }));

      setTimeout(() => {
        logout();
      }, 100);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [admin, logout]);
}