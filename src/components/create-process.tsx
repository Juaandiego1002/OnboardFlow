'use client';

import { useState } from 'react';
import { useAppStore, OnboardingProcess } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Rocket, Plus, Trash2, GripVertical, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StepForm {
  title: string;
  description: string;
  week: number;
  type: string;
  materialUrl: string;
}

const defaultStep: StepForm = {
  title: '',
  description: '',
  week: 1,
  type: 'task',
  materialUrl: '',
};

export function CreateProcess() {
  const {
    admin,
    setView,
    setLoading,
    isLoading,
    setProcesses,
    processes,
    setSelectedProcess,
  } = useAppStore();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [steps, setSteps] = useState<StepForm[]>([{ ...defaultStep }]);
  const [showSteps, setShowSteps] = useState(false);

  const addStep = () => {
    setSteps([...steps, { ...defaultStep, week: Math.min(steps.length + 1, durationWeeks) }]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  const updateStep = (index: number, field: keyof StepForm, value: string | number) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Nombre requerido', description: 'Dale un nombre al proceso.', variant: 'destructive' });
      return;
    }

    const validSteps = steps.filter((s) => s.title.trim());
    if (validSteps.length === 0) {
      toast({ title: 'Añade al menos un paso', description: 'El proceso necesita al menos un paso.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/processes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: admin?.id,
          name,
          description,
          durationWeeks,
          steps: validSteps.map((s, i) => ({
            ...s,
            order: i,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
        return;
      }

      // Refresh processes
      const procRes = await fetch(`/api/processes?adminId=${admin?.id}`);
      const procData = await procRes.json();
      if (procRes.ok) {
        setProcesses(procData.processes);
        // Set selectedProcess from the refreshed list (includes invites and full data)
        const newProcess = procData.processes.find(
          (p: { id: string }) => p.id === data.process.id
        );
        if (newProcess) {
          setSelectedProcess(newProcess);
        } else {
          setSelectedProcess(data.process);
        }
      } else {
        setSelectedProcess(data.process);
      }

      toast({
        title: 'Proceso creado',
        description: `"${name}" ha sido creado con ${validSteps.length} pasos.`,
      });

      // Go to manage steps
      setView('manage-steps');
    } catch {
      toast({ title: 'Error', description: 'No se pudo crear el proceso.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => setView('admin-panel')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="font-semibold">Crear Proceso de Onboarding</h1>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Rocket className="h-5 w-5 text-emerald-600" />
                Información del Proceso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="process-name">Nombre del proceso</Label>
                <Input
                  id="process-name"
                  placeholder="Ej: Onboarding de Ingeniería"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="process-desc">Descripción (opcional)</Label>
                <Textarea
                  id="process-desc"
                  placeholder="Describe brevemente el objetivo de este proceso..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duración (semanas)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  max={52}
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 1)}
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground bg-muted rounded-md px-2 py-0.5">
                    {steps.filter((s) => s.title.trim()).length}
                  </span>
                  Pasos del Proceso
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSteps(!showSteps)}
                >
                  <ChevronDown className={`mr-1 h-4 w-4 transition-transform ${showSteps ? 'rotate-180' : ''}`} />
                  {showSteps ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>
            </CardHeader>
            {showSteps && (
              <CardContent className="space-y-4">
                {steps.map((step, index) => (
                  <div key={index} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <span className="text-sm font-medium">Paso {index + 1}</span>
                      </div>
                      {steps.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-destructive hover:text-destructive"
                          onClick={() => removeStep(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Título *</Label>
                        <Input
                          placeholder="Ej: Configurar entorno de desarrollo"
                          value={step.title}
                          onChange={(e) => updateStep(index, 'title', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Semana</Label>
                          <Input
                            type="number"
                            min={1}
                            max={durationWeeks}
                            value={step.week}
                            onChange={(e) => updateStep(index, 'week', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tipo</Label>
                          <Select
                            value={step.type}
                            onValueChange={(val) => updateStep(index, 'type', val)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="task">Tarea</SelectItem>
                              <SelectItem value="reading">Lectura</SelectItem>
                              <SelectItem value="meeting">Reunión</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Descripción</Label>
                      <Textarea
                        placeholder="Describe lo que debe hacer en este paso..."
                        value={step.description}
                        onChange={(e) => updateStep(index, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">URL de material (opcional)</Label>
                      <Input
                        placeholder="https://..."
                        value={step.materialUrl}
                        onChange={(e) => updateStep(index, 'materialUrl', e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" className="w-full" onClick={addStep}>
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir otro paso
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setView('admin-panel')}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Guardar proceso'
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
