'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, BookOpen, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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
  step: { id: string; title: string; description: string; type: string; materialUrl: string; completed?: boolean };
  onComplete?: (stepId: string) => void;
  onUndo?: (stepId: string) => void;
  isEmployeeView?: boolean;
}) {
  return (
    <div
      className={cn(
        'group relative rounded-xl border p-4 transition-all duration-200',
        step.completed
          ? 'border-emerald-200 bg-emerald-50/50'
          : 'border-border bg-card hover:border-emerald-300 hover:shadow-sm'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        {isEmployeeView && (
          <button
            onClick={() =>
              step.completed ? onUndo?.(step.id) : onComplete?.(step.id)
            }
            className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
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
