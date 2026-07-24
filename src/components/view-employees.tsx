'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  ArrowLeft,
  UserPlus,
  Copy,
  CheckCircle2,
  Users,
  Mail,
  User,
  ExternalLink,
  Search,
  X,
  FileText,
  ShieldCheck,
  Shield,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ViewEmployees() {
  const {
    admin,
    selectedProcess,
    setView,
    setLoading,
    isLoading,
    setProcesses,
    setSelectedProcess,
    setPendingEmployeeToken,
    logout,
  } = useAppStore();
  const { toast } = useToast();

  const process = selectedProcess;
  const steps = process?.steps || [];
  const invites = process?.invites || [];
  const totalSteps = steps.length;

  const [showInvite, setShowInvite] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [inviteNameError, setInviteNameError] = useState('');
  const [inviteEmailError, setInviteEmailError] = useState('');
  const [lastCreatedToken, setLastCreatedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [registeredEmployees, setRegisteredEmployees] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [selectedRegisteredId, setSelectedRegisteredId] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');

  useEffect(() => {
    if (!admin) return;
    fetch(`/api/employees?adminId=${admin.id}`).then(r => r.json()).then(d => {
      if (d.employees) setRegisteredEmployees(d.employees);
    }).catch(() => {});
  }, [admin]);

  const refreshData = async () => {
    if (!admin) return;
    try {
      const res = await fetch(`/api/processes?adminId=${admin.id}`);
      const data = await res.json();
      if (res.ok) {
        setProcesses(data.processes);
        const updated = data.processes.find((p: typeof process) => p.id === process?.id);
        if (updated) setSelectedProcess(updated);
      }
    } catch {
      // silent
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!process) return;
    let valid = true;
    setInviteNameError('');
    setInviteEmailError('');
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    if (!employeeName.trim()) { setInviteNameError('El nombre es obligatorio'); valid = false; }
    else if (employeeName.trim().length < 2) { setInviteNameError('El nombre debe tener al menos 2 caracteres'); valid = false; }
    else if (!nameRegex.test(employeeName.trim())) { setInviteNameError('El nombre solo puede contener letras y espacios'); valid = false; }
    if (!employeeEmail.trim()) { setInviteEmailError('El correo es obligatorio'); valid = false; }
    else if (!employeeEmail.includes('@')) { setInviteEmailError('Correo no válido'); valid = false; }
    else {
      const domain = employeeEmail.split('@')[1];
      if (!domain || !domain.includes('.') || (domain.split('.').pop() || '').length < 2) {
        setInviteEmailError('El correo debe tener un dominio válido (ej: usuario@empresa.com)');
        valid = false;
      }
    }
    if (!valid) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/processes/${process.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeName, employeeEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
        return;
      }

      toast({
        title: 'Empleado invitado',
        description: data.message,
      });

      if (data.invite?.token) {
        setLastCreatedToken(data.invite.token);
        try {
          await navigator.clipboard.writeText(data.invite.token);
        } catch {
          // clipboard not available
        }
      }

      setEmployeeName('');
      setEmployeeEmail('');
      setShowInvite(false);
      refreshData();
    } catch {
      toast({
        title: 'Error de conexión',
        description: 'No pudimos enviar el correo. Comprueba la dirección e inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token).then(() => {
      setCopiedToken(token);
      toast({ title: 'Token copiado', description: 'El enlace de acceso ha sido copiado al portapapeles.' });
      setTimeout(() => setCopiedToken(null), 3000);
    });
  };

  const handleDeleteInvite = async (inviteId: string, employeeName: string) => {
    if (!confirm(`¿Eliminar la invitación de ${employeeName}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/invite/${inviteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Invitación eliminada', description: `La invitación de ${employeeName} ha sido eliminada.` });
        refreshData();
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar la invitación.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (progressId: string) => {
    if (!admin) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/progress/${progressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: admin.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Tarea verificada', description: 'La evidencia ha sido verificada correctamente.' });
        refreshData();
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo verificar la tarea.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!process) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => { refreshData(); setView('admin-panel'); }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="font-semibold truncate">{process.name} — Empleados</h1>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
        {/* Invite Section */}
        {!showInvite ? (
          <Button className="w-full group" onClick={() => setShowInvite(true)}>
            <UserPlus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            Invitar nuevo empleado
          </Button>
        ) : (
          <Card className="border-emerald-200 bg-gradient-to-b from-emerald-50/30 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-emerald-700" />
                </div>
                Invitar Empleado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4">
                {registeredEmployees.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Seleccionar del directorio</Label>
                    <Select
                      value={selectedRegisteredId}
                      onValueChange={(val) => {
                        setSelectedRegisteredId(val);
                        const emp = registeredEmployees.find(e => e.id === val);
                        if (emp) {
                          setEmployeeName(emp.name);
                          setEmployeeEmail(emp.email);
                        }
                      }}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Elige un empleado registrado..." />
                      </SelectTrigger>
                      <SelectContent>
                        {registeredEmployees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} — {emp.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Nombre del empleado</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className={`pl-9 ${inviteNameError ? 'border-red-400' : ''}`}
                        placeholder="Ej: María García"
                        value={employeeName}
                        onChange={(e) => { setEmployeeName(e.target.value); setInviteNameError(''); setSelectedRegisteredId(''); }}
                      />
                    </div>
                    {inviteNameError && <p className="text-xs text-red-500">{inviteNameError}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className={`pl-9 ${inviteEmailError ? 'border-red-400' : ''}`}
                        type="email"
                        placeholder="maria@startup.com"
                        value={employeeEmail}
                        onChange={(e) => { setEmployeeEmail(e.target.value); setInviteEmailError(''); setSelectedRegisteredId(''); }}
                      />
                    </div>
                    {inviteEmailError && <p className="text-xs text-red-500">{inviteEmailError}</p>}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button type="submit" size="sm" disabled={isLoading || !employeeName.trim() || !employeeEmail.trim()}>
                    {isLoading ? <Loader2 className="mr-1.5 h-3.5 animate-spin" /> : <Mail className="mr-1.5 h-3.5" />}
                    Enviar invitación
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowInvite(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Token creado */}
        {lastCreatedToken && (
          <Card className="border-emerald-300 bg-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-4 w-4 text-emerald-700" />
                    <p className="text-sm font-semibold text-emerald-800">
                      Enlace de acceso creado
                    </p>
                  </div>
                  <p className="text-xs text-emerald-700 mb-2">
                    Comparte este enlace con el empleado para que acceda a su onboarding:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-white border border-emerald-200 rounded px-2 py-1.5 text-emerald-900 break-all select-all font-mono">
                      {lastCreatedToken}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 bg-white"
                      onClick={() => copyToClipboard(lastCreatedToken)}
                    >
                      {copiedToken === lastCreatedToken ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 h-6 w-6 p-0"
                  onClick={() => setLastCreatedToken(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employee List */}
        {invites.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Aún no hay empleados invitados a este proceso.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
          {invites.length > 5 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar empleados invitados..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          )}
          <div className="space-y-3">
            {invites
              .filter((inv) => {
                if (!employeeSearch) return true;
                const q = employeeSearch.toLowerCase();
                return inv.employeeName.toLowerCase().includes(q) || inv.employeeEmail.toLowerCase().includes(q);
              })
              .map((invite) => {
              const completed = invite.progress.length;
              const percent = totalSteps > 0 ? Math.round((completed / totalSteps) * 100) : 0;
              const isComplete = percent === 100;

              return (
                <Card key={invite.id} className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-l-4 border-l-transparent hover:border-l-emerald-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm text-white text-xs font-bold">
                            {invite.employeeName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-medium text-sm">{invite.employeeName}</h4>
                              {isComplete && (
                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] border-emerald-200">
                                  <CheckCircle2 className="mr-0.5 h-3 w-3" />
                                  Completado
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{invite.employeeEmail}</p>
                          </div>
                        </div>

                        {/* Token preview */}
                        <div
                          className="flex items-center gap-2 mb-2 cursor-pointer group"
                          onClick={() => copyToClipboard(invite.token)}
                        >
                          <code className="text-[10px] bg-muted rounded px-1.5 py-0.5 text-muted-foreground group-hover:text-foreground truncate max-w-[200px] sm:max-w-[400px] font-mono">
                            {invite.token}
                          </code>
                          <Copy className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0" />
                          <span className="text-[10px] text-muted-foreground group-hover:text-emerald-600">
                            {copiedToken === invite.token ? '✓ Copiado' : 'Copiar'}
                          </span>
                        </div>

                        {/* Progress */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1">
                            <Progress value={percent} className="h-1.5" />
                          </div>
                          <span className="text-xs text-muted-foreground w-10 text-right">
                            {completed}/{totalSteps}
                          </span>
                        </div>

                        {/* Evidence per completed step */}
                        {invite.progress.length > 0 && (
                          <div className="space-y-1.5 mb-2">
                            {invite.progress.map((p) => (
                              <div key={p.id} className="flex items-start gap-2 text-xs">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-muted-foreground">{p.step.title}</span>
                                  {p.evidence && (
                                    <div className="flex items-start gap-1 mt-0.5 text-muted-foreground/70">
                                      <FileText className="h-2.5 w-2.5 mt-0.5 shrink-0" />
                                      <span className="italic">{p.evidence}</span>
                                    </div>
                                  )}
                                  {p.evidenceUrl && (
                                    <a
                                      href={p.evidenceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 mt-0.5 text-emerald-700 hover:underline"
                                    >
                                      <ExternalLink className="h-2.5 w-2.5" />
                                      Ver evidencia
                                    </a>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {p.verifiedAt ? (
                                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                                      <ShieldCheck className="mr-0.5 h-2.5 w-2.5" />
                                      Verificada
                                    </Badge>
                                  ) : p.evidence || p.evidenceUrl ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 text-[10px] text-amber-700 hover:text-amber-800 hover:bg-amber-50 px-1"
                                      onClick={() => handleVerify(p.id)}
                                      disabled={isLoading}
                                    >
                                      <Shield className="mr-0.5 h-2.5 w-2.5" />
                                      Verificar
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[11px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 p-0"
                            onClick={() => {
                              setPendingEmployeeToken(invite.token);
                              logout();
                              setPendingEmployeeToken(invite.token);
                              setView('employee-access');
                            }}
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Probar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[11px] text-destructive hover:text-destructive p-0"
                            onClick={() => handleDeleteInvite(invite.id, invite.employeeName)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          </>
        )}
      </main>
    </div>
  );
}
