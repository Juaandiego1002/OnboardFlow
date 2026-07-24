'use client';

import { useEffect, useCallback, useState, useMemo } from 'react';
import { useAppStore, OnboardingProcess } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Info,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Search,
  Filter,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  const [infoProcess, setInfoProcess] = useState<OnboardingProcess | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'empty'>('all');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

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

  const handleChangePassword = async () => {
    if (!admin) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: 'Completa todos los campos', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'La nueva contraseña debe tener al menos 6 caracteres', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Las contraseñas no coinciden', variant: 'destructive' });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: admin.id, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Contraseña actualizada', description: 'Tu contraseña ha sido cambiada correctamente.' });
        setShowChangePassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo cambiar la contraseña.', variant: 'destructive' });
    } finally {
      setChangingPassword(false);
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

  const filteredProcesses = useMemo(() => {
    return processes.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = statusFilter === 'all' ||
        (statusFilter === 'active' && p.invites.length > 0) ||
        (statusFilter === 'empty' && p.invites.length === 0);
      return matchesSearch && matchesFilter;
    });
  }, [processes, searchQuery, statusFilter]);

  const globalStats = useMemo(() => {
    let totalInvites = 0;
    let totalCompleted = 0;
    let totalProgressSteps = 0;
    processes.forEach((p) => {
      const steps = p.steps?.length || 0;
      p.invites?.forEach((inv) => {
        totalInvites++;
        totalCompleted += inv.progress?.length || 0;
        totalProgressSteps += steps;
      });
    });
    const completionRate = totalProgressSteps > 0
      ? Math.round((totalCompleted / totalProgressSteps) * 100)
      : 0;
    return { totalProcesses: processes.length, totalInvites, completionRate };
  }, [processes]);

  if (!admin) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
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
            <Button variant="ghost" size="sm" onClick={() => setShowChangePassword(true)} title="Cambiar contraseña">
              <KeyRound className="h-4 w-4" />
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
        {/* Stats Overview */}
        {processes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 backdrop-blur-sm p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{globalStats.totalProcesses}</p>
                <p className="text-xs text-muted-foreground">Procesos activos</p>
              </div>
            </div>
            <div className="rounded-xl border bg-gradient-to-b from-blue-500/10 to-blue-500/5 backdrop-blur-sm p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{globalStats.totalInvites}</p>
                <p className="text-xs text-muted-foreground">Empleados invitados</p>
              </div>
            </div>
            <div className="rounded-xl border bg-gradient-to-b from-amber-500/10 to-amber-500/5 backdrop-blur-sm p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{globalStats.completionRate}%</p>
                <p className="text-xs text-muted-foreground">Completado global</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Mis Procesos</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Crea y gestiona los procesos de incorporación de tu startup
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setView('manage-employees')}>
              <Users className="mr-2 h-4 w-4" />
              Empleados
            </Button>
            <Button onClick={() => setView('create-process')}>
              <Plus className="mr-2 h-4 w-4" />
              Crear proceso
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {processes.length === 0 && !isLoading && (
          <Card className="border-dashed bg-gradient-to-b from-muted/30 to-muted/10">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-6 shadow-inner animate-float">
                <FolderOpen className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">No hay procesos todavía</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-8 leading-relaxed">
                Crea tu primer proceso de onboarding para empezar a guiar a tus nuevos empleados
                paso a paso durante sus primeras semanas.
              </p>
              <Button size="lg" onClick={() => setView('create-process')} className="shadow-lg shadow-emerald-500/20">
                <Plus className="mr-2 h-4 w-4" />
                Crear primer proceso
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search & Filter */}
        {processes.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar procesos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex gap-1.5">
              {(['all', 'active', 'empty'] as const).map((f) => (
                <Button
                  key={f}
                  variant={statusFilter === f ? 'default' : 'outline'}
                  size="sm"
                  className="h-9 text-xs"
                  onClick={() => setStatusFilter(f)}
                >
                  {f === 'all' ? 'Todos' : f === 'active' ? 'Con empleados' : 'Sin empleados'}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Filtered Process List */}
        {filteredProcesses.length === 0 && processes.length > 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No se encontraron procesos con esos criterios</p>
              <Button variant="link" size="sm" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="mt-2">
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5">
          {filteredProcesses.map((process) => {
            const stats = getProcessStats(process);
            return (
              <Card key={process.id} className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group border-l-4 border-l-transparent hover:border-l-emerald-500">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        <h3 className="font-semibold text-lg truncate">{process.name}</h3>
                        <Badge variant="secondary" className="text-[10px] shrink-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          <Clock className="mr-1 h-3 w-3" />
                          {process.durationWeeks} sem.
                        </Badge>
                      </div>
                      {process.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                          {process.description}
                        </p>
                      )}

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 mb-3 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 rounded-full px-2.5 py-1">
                          <Edit3 className="h-3 w-3" />
                          {stats.totalSteps} paso{stats.totalSteps !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 rounded-full px-2.5 py-1">
                          <Users className="h-3 w-3" />
                          {stats.employeeCount} empleado{stats.employeeCount !== 1 ? 's' : ''}
                        </div>
                        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
                          stats.avgProgress === 100
                            ? 'bg-emerald-100 text-emerald-700 font-medium'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}>
                          <TrendingUp className="h-3 w-3" />
                          {stats.avgProgress}%
                        </div>
                      </div>

                      {/* Employee progress bars */}
                      {process.invites.length > 0 && (
                        <div className="space-y-1.5 mt-4 pt-3 border-t">
                          {process.invites.map((invite) => {
                            const completed = invite.progress.length;
                            const percent = stats.totalSteps > 0 ? Math.round((completed / stats.totalSteps) * 100) : 0;
                            return (
                              <div key={invite.id} className="flex items-center gap-3 text-sm group/bar">
                                <span className="text-muted-foreground w-28 truncate text-xs">
                                  {invite.employeeName}
                                </span>
                                <div className="flex-1 relative">
                                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                                        percent === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-300 to-emerald-400'
                                      }`}
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                </div>
                                <span className={`text-xs w-8 text-right font-medium ${
                                  percent === 100 ? 'text-emerald-600' : 'text-muted-foreground'
                                }`}>
                                  {percent}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Actions - horizontal icon buttons */}
                    <div className="flex items-start gap-1 shrink-0 pt-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/80"
                        onClick={() => setInfoProcess(process)}
                        title="Ver información"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
                        onClick={() => handleEditProcess(process)}
                        title="Editar proceso"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteProcess(process.id)}
                        title="Eliminar proceso"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        )}

        {/* Loading */}
        {isLoading && processes.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </main>

      {/* Process Info Dialog */}
      <Dialog open={!!infoProcess} onOpenChange={(open) => { if (!open) setInfoProcess(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {infoProcess?.name}
            </DialogTitle>
            {infoProcess?.description && (
              <DialogDescription>{infoProcess.description}</DialogDescription>
            )}
          </DialogHeader>
          {infoProcess && (
            <div className="space-y-5 py-2">
              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-gradient-to-b from-amber-500/10 to-amber-500/5 backdrop-blur-sm border border-amber-400/20 p-4 text-center">
                  <Clock className="h-5 w-5 mx-auto text-amber-600 dark:text-amber-400 mb-1" />
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{infoProcess.durationWeeks}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Semanas</p>
                </div>
                <div className="rounded-xl bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 backdrop-blur-sm border border-emerald-400/20 p-4 text-center">
                  <Edit3 className="h-5 w-5 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{infoProcess.steps?.length || 0}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Pasos</p>
                </div>
                <div className="rounded-xl bg-gradient-to-b from-blue-500/10 to-blue-500/5 backdrop-blur-sm border border-blue-400/20 p-4 text-center">
                  <Users className="h-5 w-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{infoProcess.invites?.length || 0}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Empleados</p>
                </div>
              </div>

              {/* Employees list */}
              {infoProcess.invites && infoProcess.invites.length > 0 ? (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Empleados invitados
                  </p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {infoProcess.invites.map((inv) => {
                      const completed = inv.progress?.length || 0;
                      const total = infoProcess.steps?.length || 0;
                      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                      return (
                        <div key={inv.id} className="flex items-center justify-between gap-3 text-sm bg-gradient-to-b from-muted/50 to-muted/30 backdrop-blur-sm rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                              {inv.employeeName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{inv.employeeName}</p>
                              <p className="text-xs text-muted-foreground truncate">{inv.employeeEmail}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  pct === 100 ? 'bg-emerald-500' : 'bg-emerald-300'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No hay empleados invitados a este proceso</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-3 sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
            <Button
              onClick={() => {
                setInfoProcess(null);
                setSelectedProcess(infoProcess!);
                setView('view-employees');
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Gestionar empleados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showChangePassword} onOpenChange={(open) => { if (!open) { setShowChangePassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-emerald-600" />
              Cambiar Contraseña
            </DialogTitle>
            <DialogDescription>
              Establece una nueva contraseña para acceder al panel de administración.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Contraseña actual</Label>
              <div className="relative">
                <Input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Tu contraseña actual"
                  className="pr-9"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="pr-9"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Confirmar nueva contraseña</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="pr-9"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleChangePassword} disabled={changingPassword}>
              {changingPassword ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
              ) : (
                <><KeyRound className="mr-2 h-4 w-4" />Cambiar contraseña</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        OnboardFlow &mdash; Panel de administración
      </footer>
    </div>
  );
}
