'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Edit3,
  CheckCircle2,
  Circle,
  BookOpen,
  Users,
  GripVertical,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const stepTypeConfig = {
  task: { label: 'Tarea', icon: CheckCircle2 },
  reading: { label: 'Lectura', icon: BookOpen },
  meeting: { label: 'Reunión', icon: Users },
};

export function ManageSteps() {
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

  const [processName, setProcessName] = useState(process?.name || '');
  const [processDesc, setProcessDesc] = useState(process?.description || '');
  const [processDuration, setProcessDuration] = useState(process?.durationWeeks || 4);
  const [editingProcess, setEditingProcess] = useState(false);

  // New step form
  const [showAddStep, setShowAddStep] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newStepWeek, setNewStepWeek] = useState(1);
  const [newStepType, setNewStepType] = useState('task');
  const [newStepUrl, setNewStepUrl] = useState('');

  // Editing step
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editStepTitle, setEditStepTitle] = useState('');
  const [editStepDesc, setEditStepDesc] = useState('');
  const [editStepWeek, setEditStepWeek] = useState(1);
  const [editStepType, setEditStepType] = useState('task');
  const [editStepUrl, setEditStepUrl] = useState('');

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

  const handleUpdateProcess = async () => {
    if (!process) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/processes/${process.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: processName,
          description: processDesc,
          durationWeeks: processDuration,
        }),
      });
      if (res.ok) {
        toast({ title: 'Proceso actualizado' });
        setEditingProcess(false);
        refreshData();
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!process || !newStepTitle.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processId: process.id,
          title: newStepTitle,
          description: newStepDesc,
          week: newStepWeek,
          type: newStepType,
          materialUrl: newStepUrl,
          order: steps.length,
        }),
      });
      if (res.ok) {
        toast({ title: 'Paso añadido' });
        setNewStepTitle('');
        setNewStepDesc('');
        setNewStepWeek(1);
        setNewStepType('task');
        setNewStepUrl('');
        setShowAddStep(false);
        refreshData();
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo añadir el paso.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStep = async (stepId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/steps/${stepId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editStepTitle,
          description: editStepDesc,
          week: editStepWeek,
          type: editStepType,
          materialUrl: editStepUrl,
        }),
      });
      if (res.ok) {
        toast({ title: 'Paso actualizado' });
        setEditingStepId(null);
        refreshData();
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/steps/${stepId}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Paso eliminado' });
        refreshData();
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const startEditStep = (step: (typeof steps)[number]) => {
    setEditingStepId(step.id);
    setEditStepTitle(step.title);
    setEditStepDesc(step.description);
    setEditStepWeek(step.week);
    setEditStepType(step.type);
    setEditStepUrl(step.materialUrl);
  };

  if (!process) return null;

  // Group steps by week
  const stepsByWeek: Record<number, typeof steps> = {};
  steps.forEach((step) => {
    const w = step.week;
    if (!stepsByWeek[w]) stepsByWeek[w] = [];
    stepsByWeek[w].push(step);
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => { refreshData(); setView('admin-panel'); }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="font-semibold truncate">{process.name}</h1>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
        {/* Process Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Información del Proceso</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setEditingProcess(!editingProcess)}>
                {editingProcess ? 'Cancelar' : <><Edit3 className="mr-1.5 h-3.5 w-3.5" />Editar</>}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingProcess ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nombre</Label>
                  <Input value={processName} onChange={(e) => setProcessName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Descripción</Label>
                  <Textarea value={processDesc} onChange={(e) => setProcessDesc(e.target.value)} rows={2} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Duración (semanas)</Label>
                  <Input type="number" min={1} max={52} value={processDuration} onChange={(e) => setProcessDuration(parseInt(e.target.value) || 1)} className="w-32" />
                </div>
                <Button size="sm" onClick={handleUpdateProcess} disabled={isLoading}>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Guardar cambios
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">{process.name}</p>
                {process.description && <p className="text-sm text-muted-foreground">{process.description}</p>}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Badge variant="outline">{process.durationWeeks} semanas</Badge>
                  <Badge variant="outline">{steps.length} pasos</Badge>
                  <Badge variant="outline">{invites.length} empleados</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Steps by Week */}
        {Object.entries(stepsByWeek)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([week, weekSteps]) => (
            <Card key={week}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    {week}
                  </span>
                  Semana {week}
                  <span className="text-xs font-normal text-muted-foreground">({weekSteps.length} paso{weekSteps.length !== 1 ? 's' : ''})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {weekSteps.map((step) => {
                  const typeInfo = stepTypeConfig[step.type as keyof typeof stepTypeConfig] || stepTypeConfig.task;
                  const isEditing = editingStepId === step.id;

                  if (isEditing) {
                    return (
                      <div key={step.id} className="rounded-lg border border-emerald-200 p-4 space-y-3 bg-emerald-50/30">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Título</Label>
                            <Input value={editStepTitle} onChange={(e) => setEditStepTitle(e.target.value)} />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Semana</Label>
                              <Input type="number" min={1} value={editStepWeek} onChange={(e) => setEditStepWeek(parseInt(e.target.value) || 1)} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Tipo</Label>
                              <Select value={editStepType} onValueChange={setEditStepType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
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
                          <Textarea value={editStepDesc} onChange={(e) => setEditStepDesc(e.target.value)} rows={2} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">URL material</Label>
                          <Input value={editStepUrl} onChange={(e) => setEditStepUrl(e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateStep(step.id)} disabled={isLoading}>
                            <Save className="mr-1.5 h-3.5 w-3.5" />
                            Guardar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingStepId(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={step.id} className="group rounded-lg border p-3 flex items-start gap-3 hover:border-emerald-300 transition-colors">
                      <GripVertical className="mt-0.5 h-4 w-4 text-muted-foreground cursor-grab shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">{step.title}</h4>
                          <Badge variant="secondary" className="text-xs">{typeInfo.label}</Badge>
                        </div>
                        {step.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{step.description}</p>
                        )}
                        {step.materialUrl && (
                          <a href={step.materialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline mt-1 inline-flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> Material adjunto
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEditStep(step)}>
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteStep(step.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}

        {/* Add Step */}
        {!showAddStep ? (
          <Button variant="outline" className="w-full" onClick={() => setShowAddStep(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Añadir nuevo paso
          </Button>
        ) : (
          <Card className="border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Nuevo Paso</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStep} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Título *</Label>
                    <Input placeholder="Ej: Revisión de código con el equipo" value={newStepTitle} onChange={(e) => setNewStepTitle(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Semana</Label>
                      <Input type="number" min={1} max={processDuration} value={newStepWeek} onChange={(e) => setNewStepWeek(parseInt(e.target.value) || 1)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tipo</Label>
                      <Select value={newStepType} onValueChange={setNewStepType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Textarea placeholder="Describe este paso..." value={newStepDesc} onChange={(e) => setNewStepDesc(e.target.value)} rows={2} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">URL material (opcional)</Label>
                  <Input placeholder="https://..." value={newStepUrl} onChange={(e) => setNewStepUrl(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={isLoading || !newStepTitle.trim()}>
                    {isLoading ? <Loader2 className="mr-1.5 h-3.5 animate-spin" /> : <Plus className="mr-1.5 h-3.5" />}
                    Añadir paso
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddStep(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
