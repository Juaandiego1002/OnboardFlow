'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StepCard, ProgressBar } from '@/components/step-card';
import {
  ArrowLeft,
  CheckCircle2,
  PartyPopper,
  Loader2,
  Rocket,
  BookOpen,
  Users,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EmployeeOnboarding() {
  const {
    employeeData,
    setView,
    setLoading,
    isLoading,
    setEmployeeData,
  } = useAppStore();
  const { toast } = useToast();

  const refreshData = useCallback(async () => {
    if (!employeeData) return;
    try {
      // We need to get the invite token - let's refetch from the store
      // Since we don't store the token in employeeData, we'll get it from the URL or store
      // For simplicity, we refetch by using the invite data already loaded
    } catch {
      // silent
    }
  }, [employeeData]);

  const handleComplete = async (stepId: string) => {
    if (!employeeData) return;
    setLoading(true);
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId: employeeData.inviteId, stepId }),
      });

      const data = await res.json();

      if (res.ok && !data.alreadyCompleted) {
        toast({
          title: 'Tarea completada',
          description: 'Has marcado esta tarea como completada.',
        });

        // Update local state
        const newStepsByWeek = { ...employeeData.stepsByWeek };
        let newCompleted = employeeData.completedSteps;

        for (const week of Object.keys(newStepsByWeek)) {
          const weekNum = Number(week);
          newStepsByWeek[weekNum] = newStepsByWeek[weekNum].map((step) =>
            step.id === stepId ? { ...step, completed: true } : step
          );
        }

        newCompleted++;
        const newPercent = employeeData.totalSteps > 0 ? Math.round((newCompleted / employeeData.totalSteps) * 100) : 0;

        setEmployeeData({
          ...employeeData,
          stepsByWeek: newStepsByWeek,
          completedSteps: newCompleted,
          progressPercent: newPercent,
        });
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar el progreso.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async (stepId: string) => {
    if (!employeeData) return;
    setLoading(true);
    try {
      const res = await fetch('/api/progress', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId: employeeData.inviteId, stepId }),
      });

      if (res.ok) {
        toast({
          title: 'Tarea desmarcada',
          description: 'La tarea vuelve a estar pendiente.',
        });

        const newStepsByWeek = { ...employeeData.stepsByWeek };
        let newCompleted = employeeData.completedSteps;

        for (const week of Object.keys(newStepsByWeek)) {
          const weekNum = Number(week);
          newStepsByWeek[weekNum] = newStepsByWeek[weekNum].map((step) =>
            step.id === stepId ? { ...step, completed: false } : step
          );
        }

        newCompleted = Math.max(0, newCompleted - 1);
        const newPercent = employeeData.totalSteps > 0 ? Math.round((newCompleted / employeeData.totalSteps) * 100) : 0;

        setEmployeeData({
          ...employeeData,
          stepsByWeek: newStepsByWeek,
          completedSteps: newCompleted,
          progressPercent: newPercent,
        });
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo desmarcar la tarea.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!employeeData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No se encontraron datos del proceso.</p>
            <Button variant="outline" className="mt-4" onClick={() => setView('landing')}>
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { employeeName, process, stepsByWeek, totalSteps, completedSteps, progressPercent } = employeeData;
  const isComplete = progressPercent === 100;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => { setEmployeeData(null); setView('landing'); }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Salir
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-sm truncate">{process.name}</h1>
            <p className="text-xs text-muted-foreground truncate">Bienvenido, {employeeName}</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-6 space-y-6">
        {/* Progress Overview */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold">Tu Progreso</h2>
                <p className="text-sm text-muted-foreground">
                  {process.durationWeeks} semanas de onboarding
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-emerald-700">{progressPercent}%</span>
              </div>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {completedSteps} de {totalSteps} pasos completados
            </p>
          </CardContent>
        </Card>

        {/* Completion message */}
        {isComplete && (
          <Card className="border-emerald-300 bg-emerald-50">
            <CardContent className="p-6 text-center">
              <PartyPopper className="mx-auto h-12 w-12 text-emerald-600 mb-3" />
              <h2 className="text-xl font-bold text-emerald-800 mb-2">Felicidades!</h2>
              <p className="text-sm text-emerald-700">
                Has completado todo tu proceso de onboarding. Bienvenido al equipo!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Steps by Week */}
        {Object.entries(stepsByWeek)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([week, weekSteps]) => {
            const weekCompleted = weekSteps.filter((s) => s.completed).length;
            const weekTotal = weekSteps.length;
            const weekPercent = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

            return (
              <Card key={week}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        weekPercent === 100
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {weekPercent === 100 ? <CheckCircle2 className="h-4 w-4" /> : week}
                      </span>
                      Semana {week}
                      <span className="text-xs font-normal text-muted-foreground">
                        ({weekCompleted}/{weekTotal})
                      </span>
                    </CardTitle>
                    <Badge variant={weekPercent === 100 ? 'default' : 'outline'} className={
                      weekPercent === 100 ? 'bg-emerald-100 text-emerald-800' : ''
                    }>
                      {weekPercent}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {weekSteps.map((step) => (
                    <StepCard
                      key={step.id}
                      step={step}
                      onComplete={handleComplete}
                      onUndo={handleUndo}
                      isEmployeeView
                    />
                  ))}
                </CardContent>
              </Card>
            );
          })}

        {Object.keys(stepsByWeek).length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No hay pasos definidos en este proceso todavía.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        OnboardFlow — Tu proceso de onboarding
      </footer>
    </div>
  );
}

function AlertCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
