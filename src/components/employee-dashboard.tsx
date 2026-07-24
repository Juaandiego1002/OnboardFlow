'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Rocket,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InviteItem {
  id: string;
  token: string;
  employeeName: string;
  processName: string;
  processDescription: string;
  durationWeeks: number;
  totalSteps: number;
  completedSteps: number;
  progressPercent: number;
  expiresAt: string;
}

export function EmployeeDashboard() {
  const {
    employeeEmail,
    setEmployeeEmail,
    employeeInvites,
    setEmployeeInvites,
    setView,
    setLoading,
    isLoading,
    setEmployeeData,
  } = useAppStore();
  const { toast } = useToast();
  const [fetchError, setFetchError] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeEmail) {
      setView('employee-access');
      return;
    }

    const fetchInvites = async () => {
      setFetchError(false);
      try {
        const res = await fetch(`/api/employee/invites?email=${encodeURIComponent(employeeEmail)}`);
        const data = await res.json();
        if (res.ok) {
          setEmployeeInvites(data.invites || []);
        } else {
          setFetchError(true);
        }
      } catch {
        setFetchError(true);
      }
    };

    fetchInvites();
  }, [employeeEmail, setEmployeeInvites, setView]);

  const handleOpenProcess = async (invite: InviteItem) => {
    setLoadingInvite(invite.id);
    try {
      const res = await fetch(`/api/invite/${encodeURIComponent(invite.token)}`);
      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'Error',
          description: data.error || 'No se pudo acceder al proceso.',
          variant: 'destructive',
        });
        return;
      }

      setEmployeeData(data);
      setView('employee-onboarding');
    } catch {
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar al servidor.',
        variant: 'destructive',
      });
    } finally {
      setLoadingInvite(null);
    }
  };

  const handleLogout = () => {
    setEmployeeEmail(null);
    setEmployeeInvites([]);
    setEmployeeData(null);
    setView('landing');
  };

  if (!employeeEmail) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-3xl flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Salir
          </Button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
              <Rocket className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm truncate">Mis procesos</h1>
              <p className="text-xs text-muted-foreground truncate">{employeeEmail}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-6 space-y-4">
        {fetchError && (
          <Card className="border-red-200">
            <CardContent className="py-8 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-red-400 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                No se pudieron cargar tus procesos.
              </p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {!fetchError && employeeInvites.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No tienes procesos de onboarding activos.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Pide a tu administrador que te envíe un enlace de acceso.
              </p>
            </CardContent>
          </Card>
        )}

        {employeeInvites.map((invite) => {
          const isComplete = invite.progressPercent === 100;

          return (
            <Card
              key={invite.id}
              className={`cursor-pointer transition-all hover:shadow-md hover:border-emerald-200 ${
                loadingInvite === invite.id ? 'opacity-60 pointer-events-none' : ''
              }`}
              onClick={() => handleOpenProcess(invite)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {invite.processName}
                      {isComplete && (
                        <Badge variant="default" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completado
                        </Badge>
                      )}
                    </CardTitle>
                    {invite.processDescription && (
                      <CardDescription className="text-xs line-clamp-1">
                        {invite.processDescription}
                      </CardDescription>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className={`text-2xl font-bold ${isComplete ? 'text-emerald-600' : 'text-teal-700'}`}>
                      {invite.progressPercent}%
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {invite.completedSteps}/{invite.totalSteps} pasos
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="relative">
                    <Progress value={invite.progressPercent} className="h-2" />
                    <div
                      className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-emerald-400/20 to-teal-400/20 blur-sm"
                      style={{ width: `${invite.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{invite.durationWeeks} semanas de duración</span>
                    {loadingInvite === invite.id && (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Abriendo...
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
          <LogOut className="h-3 w-3 mr-1" />
          Cerrar sesión
        </Button>
      </footer>
    </div>
  );
}
