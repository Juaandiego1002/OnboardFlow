import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Step {
  id: string;
  title: string;
  description: string;
  week: number;
  type: 'task' | 'reading' | 'meeting';
  materialUrl: string;
  order: number;
  completed?: boolean;
  completedAt?: string | null;
}

export interface Invite {
  id: string;
  processId: string;
  employeeName: string;
  employeeEmail: string;
  token: string;
  expiresAt: string;
  progress: Array<{
    id: string;
    stepId: string;
    completedAt: string;
    step: Step;
  }>;
  createdAt: string;
}

export interface OnboardingProcess {
  id: string;
  name: string;
  description: string;
  durationWeeks: number;
  adminId: string;
  steps: Step[];
  invites: Invite[];
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  email: string;
}

export type AppView =
  | 'landing'
  | 'admin-login'
  | 'admin-panel'
  | 'create-process'
  | 'edit-process'
  | 'manage-steps'
  | 'view-employees'
  | 'employee-access'
  | 'employee-onboarding';

interface AppState {
  // Navigation
  currentView: AppView;
  setView: (view: AppView) => void;

  // Admin
  admin: Admin | null;
  setAdmin: (admin: Admin | null) => void;

  // Processes
  processes: OnboardingProcess[];
  setProcesses: (processes: OnboardingProcess[]) => void;
  selectedProcess: OnboardingProcess | null;
  setSelectedProcess: (process: OnboardingProcess | null) => void;

  // Employee view data
  employeeData: {
    inviteId: string;
    employeeName: string;
    process: {
      id: string;
      name: string;
      description: string;
      durationWeeks: number;
    };
    stepsByWeek: Record<number, Step[]>;
    totalSteps: number;
    completedSteps: number;
    progressPercent: number;
  } | null;
  setEmployeeData: (data: AppState['employeeData']) => void;

  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Notification
  notification: { type: 'success' | 'error'; message: string } | null;
  setNotification: (notification: AppState['notification']) => void;
  clearNotification: () => void;

  // Logout
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation
      currentView: 'landing',
      setView: (view) => set({ currentView: view }),

      // Admin
      admin: null,
      setAdmin: (admin) => set({ admin }),

      // Processes
      processes: [],
      setProcesses: (processes) => set({ processes }),
      selectedProcess: null,
      setSelectedProcess: (process) => set({ selectedProcess: process }),

      // Employee
      employeeData: null,
      setEmployeeData: (data) => set({ employeeData: data }),

      // Loading
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      // Notification
      notification: null,
      setNotification: (notification) => set({ notification }),
      clearNotification: () => set({ notification: null }),

      // Logout
      logout: () =>
        set({
          admin: null,
          processes: [],
          selectedProcess: null,
          currentView: 'landing',
          employeeData: null,
        }),
    }),
    {
      name: 'onboardflow-storage',
      partialize: (state) => ({
        admin: state.admin,
        // Only persist views that don't require transient data (selectedProcess, employeeData)
        currentView: ['landing', 'admin-login', 'admin-panel', 'employee-access'].includes(state.currentView)
          ? state.currentView
          : state.admin ? 'admin-panel' : 'landing',
      }),
    }
  )
);
