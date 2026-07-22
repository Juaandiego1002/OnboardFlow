'use client';

import { useState } from 'react';
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
  Link as LinkIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

export function ViewEmployees() {
  const {
    admin,
    selectedProcess,
    setView,
    setLoading,
    isLoading,
    setProcesses,
    setSelectedProcess,
  } = useAppStore();
  const { toast } = useToast();

  const process = selectedProcess;
  const steps = process?.steps || [];
  const invites = process?.invites || [];
  const totalSteps = steps.length;

  const [showInvite, setShowInvite] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

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
    if (!process || !employeeName.trim() || !employeeEmail.trim() || !employeeEmail.includes('@')) {
      toast({ title: 'Datos incompletos', description: 'Nombre y correo son obligatorios.', variant: 'destructive' });
      return;
    }

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

      // Copy token to clipboard
      if (data.invite?.token) {
        try {
          await navigator.clipboard.writeText(data.invite.token);
          setCopiedToken(data.invite.token);
        } catch {
          setCopiedToken(data.invite.token);
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

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token).then(() => {
      setCopiedToken(token);
      toast({ title: 'Token copiado', description: 'El enlace de acceso ha sido copiado al portapapeles.' });
      setTimeout(() => setCopiedToken(null), 3000);
    });
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
          <Button className="w-full" onClick={() => setShowInvite(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invitar nuevo empleado
          </Button>
        ) : (
          <Card className="border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-600" />
                Invitar Empleado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Nombre del empleado</Label>
                    <Input
                      placeholder="Ej: María García"
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Correo electrónico</Label>
                    <Input
                      type="email"
                      placeholder="maria@startup.com"
                      value={employeeEmail}
                      onChange={(e) => setEmployeeEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
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

        {/* Copied token notification */}
        {copiedToken && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-800">Token copiado al portapapeles</p>
              <p className="text-xs text-emerald-600 truncate font-mono">{copiedToken}</p>
            </div>
          </div>
        )}

        {/* Employee List */}
        {process.invites.length === 0 ? (
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
          <div className="space-y-3">
            {process.invites.map((invite) => {
              const completed = invite.progress.length;
              const percent = totalSteps > 0 ? Math.round((completed / totalSteps) * 100) : 0;
              const isComplete = percent === 100;

              return (
                <Card key={invite.id} className="transition-all hover:shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{invite.employeeName}</h4>
                          {isComplete && (
                            <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Completado
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{invite.employeeEmail}</p>

                        {/* Progress */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1">
                            <Progress value={percent} className="h-1.5" />
                          </div>
                          <span className="text-xs text-muted-foreground w-10 text-right">
                            {completed}/{totalSteps}
                          </span>
                        </div>

                        {/* Pending steps */}
                        {!isComplete && invite.progress.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Pendientes: {totalSteps - completed} de {totalSteps}
                          </p>
                        )}
                      </div>

                      {/* Copy token */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => copyToken(invite.token)}
                      >
                        {copiedToken === invite.token ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
