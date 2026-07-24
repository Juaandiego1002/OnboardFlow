'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, BookOpen, Users, FileText, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const stepTypeConfig = {
  task: { label: 'Tarea', variant: 'default' as const, icon: CheckCircle2 },
  reading: { label: 'Lectura', variant: 'secondary' as const, icon: BookOpen },
  meeting: { label: 'Reunión', variant: 'outline' as const, icon: Users },
};

export function StepTypeBadge({ type }: { type: string }) {
  const config = stepTypeConfig[type as keyof typeof stepTypeConfig] || stepTypeConfig.task;
  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
}

export function StepCard({
  step,
  onComplete,
  onUndo,
  isEmployeeView = false,
}: {
  step: {
    id: string;
    title: string;
    description: string;
    type: string;
    materialUrl: string;
    completed?: boolean;
    evidence?: string;
    evidenceUrl?: string;
    verifiedAt?: string | null;
  };
  onComplete?: (stepId: string, evidence: string, evidenceUrl: string) => void;
  onUndo?: (stepId: string) => void;
  isEmployeeView?: boolean;
}) {
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [evidence, setEvidence] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleComplete = async () => {
    setSubmitting(true);
    await onComplete?.(step.id, evidence, evidenceUrl);
    setSubmitting(false);
    setShowEvidenceForm(false);
    setEvidence('');
    setEvidenceUrl('');
  };

  const handleClick = () => {
    if (step.completed) {
      onUndo?.(step.id);
    } else if (isEmployeeView) {
      setShowEvidenceForm(true);
    }
  };

  return (
    <div
      className={cn(
        'group relative rounded-xl border transition-all duration-200',
        step.completed
          ? 'border-emerald-200 bg-emerald-50/50'
          : 'border-border bg-card hover:border-emerald-300 hover:shadow-sm'
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        {isEmployeeView && (
          <button
            onClick={handleClick}
            className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
            disabled={submitting}
          >
            {step.completed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground hover:text-emerald-500" />
            )}
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={cn(
                'font-medium text-sm',
                step.completed && 'line-through text-muted-foreground'
              )}
            >
              {step.title}
            </h4>
            <StepTypeBadge type={step.type} />
          </div>
          {step.description && (
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          )}
          {step.materialUrl && (
            <a
              href={step.materialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Ver material adjunto
            </a>
          )}

          {/* Evidence display */}
          {step.completed && (
            <div className="mt-3 space-y-1.5">
              {step.evidence && (
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>{step.evidence}</span>
                </div>
              )}
              {step.evidenceUrl && (
                <a
                  href={step.evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-emerald-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Ver evidencia
                </a>
              )}
              {step.verifiedAt && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                  <ShieldCheck className="h-3 w-3" />
                  Verificada
                </div>
              )}
            </div>
          )}

          {/* Evidence form */}
          {showEvidenceForm && !step.completed && (
            <div className="mt-3 space-y-2 border-t pt-3">
              <div className="space-y-1">
                <Label className="text-xs">Nota de finalización</Label>
                <Textarea
                  placeholder="Describe qué hiciste para completar esta tarea..."
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">URL de evidencia (opcional)</Label>
                <Input
                  placeholder="https://..."
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleComplete} disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                  )}
                  Confirmar finalización
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowEvidenceForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProgressBar({
  completed,
  total,
  className,
}: {
  completed: number;
  total: number;
  className?: string;
}) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progreso</span>
        <span className="font-medium">
          {completed} de {total} completadas ({percent}%)
        </span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  );
}
