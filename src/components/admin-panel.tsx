'use client';

import { useEffect, useCallback } from 'react';
import { useAppStore, OnboardingProcess } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/step-card';
import {
  Plus,
  ArrowLeft,
  LogOut,
  FolderOpen,
  Users,
  Clock,
  Trash2,
  Edit3,
  ChevronRight,
  Loader2,
  LayoutDashboard,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminPanel() {
  const {
    admin,
    processes,
    setView,
    setSelectedProcess,
    setLoading,
    isLoading,
    logout,
    setProcesses,
  } = useAppStore();
  const { toast } = useToast();

  const fetchProcesses = useCallback(async () => {
    if (!admin) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/processes?adminId=${admin.id}`);
      const data = await res.json();
      if (res.ok) {
        setProcesses(data.processes);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [admin, setProcesses, setLoading]);

  useEffect(() => {
    if (admin) fetchProcesses();
  }, [admin, fetchProcesses]);

  const handleDeleteProcess = async (processId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/processes/${processId}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Proceso eliminado', description: 'El proceso ha sido eliminado correctamente.' });
        fetchProcesses();
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar el proceso.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProcess = (process: OnboardingProcess) => {
    setSelectedProcess(process);
    setView('manage-steps');
  };

  const handleViewEmployees = (process: OnboardingProcess) => {
    setSelectedProcess(process);
    setView('view-employees');
  };

  const getProcessStats = (process: OnboardingProcess) => {
    const totalSteps = process.steps?.length || 0;
    const processInvites = process.invites || [];
    let totalProgress = 0;
    let employeeCount = processInvites.length;
    processInvites.forEach((invite) => {
      const completed = invite.progress?.length || 0;
      totalProgress += totalSteps > 0 ? Math.round((completed / totalSteps) * 100) : 0;
    });
    const avgProgress = employeeCount > 0 ? Math.round(totalProgress / employeeCount) : 0;
    return { totalSteps, employeeCount, avgProgress };
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">OnboardFlow</h1>
              <p className="text-xs text-muted-foreground">{admin.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchProcesses}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Actualizar
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8">
        {/* Actions */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Mis Procesos de Onboarding</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Crea y gestiona los procesos de incorporación de tu startup
            </p>
          </div>
          <Button onClick={() => setView('create-process')}>
            <Plus className="mr-2 h-4 w-4" />
            Crear proceso
          </Button>
        </div>

        {/* Empty State */}
        {processes.length === 0 && !isLoading && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No hay procesos todavía</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                Crea tu primer proceso de onboarding para empezar a guiar a tus nuevos empleados
              </p>
              <Button onClick={() => setView('create-process')}>
                <Plus className="mr-2 h-4 w-4" />
                Crear primer proceso
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Process List */}
        <div className="grid grid-cols-1 gap-4">
          {processes.map((process) => {
            const stats = getProcessStats(process);
            return (
              <Card key={process.id} className="transition-all hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate">{process.name}</h3>
                        <Badge variant="outline" className="text-xs shrink-0">
                          <Clock className="mr-1 h-3 w-3" />
                          {process.durationWeeks} semanas
                        </Badge>
                      </div>
                      {process.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {process.description}
                        </p>
                      )}

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 mb-3 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Edit3 className="h-3.5 w-3.5" />
                          {stats.totalSteps} pasos
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {stats.employeeCount} empleado{stats.employeeCount !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={stats.avgProgress === 100 ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}>
                            Progreso medio: {stats.avgProgress}%
                          </span>
                        </div>
                      </div>

                      {/* Employee progress bars */}
                      {process.invites.length > 0 && (
                        <div className="space-y-2">
                          {process.invites.map((invite) => {
                            const completed = invite.progress.length;
                            const percent = stats.totalSteps > 0 ? Math.round((completed / stats.totalSteps) * 100) : 0;
                            return (
                              <div key={invite.id} className="flex items-center gap-3 text-sm">
                                <span className="text-muted-foreground w-32 truncate">
                                  {invite.employeeName}
                                </span>
                                <div className="flex-1">
                                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        percent === 100 ? 'bg-emerald-500' : 'bg-emerald-300'
                                      }`}
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-muted-foreground w-12 text-right">
                                  {percent}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProcess(process)}
                      >
                        <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEmployees(process)}
                      >
                        <Users className="mr-1.5 h-3.5 w-3.5" />
                        Empleados
                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteProcess(process.id)}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Loading */}
        {isLoading && processes.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        OnboardFlow &mdash; Panel de administración
      </footer>
    </div>
  );
}
