import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiError, apiSuccess } from '@/lib/api-utils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const invite = await db.invite.findUnique({ where: { id: token } });
    if (!invite) {
      return apiError('Invitación no encontrada.', 404);
    }
    await db.invite.delete({ where: { id: token } });
    return apiSuccess({ success: true });
  } catch (error) {
    console.error('Delete invite error:', error);
    return apiError('Error al eliminar la invitación.', 500);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return apiError('Este enlace no es válido o ha expirado. Pide a tu administrador que te envíe uno nuevo.');
    }

    const invite = await db.invite.findUnique({
      where: { token },
      include: {
        process: {
          include: {
            steps: { orderBy: { order: 'asc' } },
          },
        },
        progress: { include: { step: true } },
      },
    });

    if (!invite) {
      return apiError('Este enlace no es válido o ha expirado. Pide a tu administrador que te envíe uno nuevo.', 404);
    }

    if (new Date() > invite.expiresAt) {
      return apiError('Este enlace ha expirado. Pide a tu administrador que te envíe uno nuevo.', 410);
    }

    const completedStepIds = new Set(invite.progress.map((p) => p.stepId));
    const stepsByWeek: Record<number, Array<{
      id: string;
      title: string;
      description: string;
      week: number;
      type: string;
      materialUrl: string;
      order: number;
      completed: boolean;
      completedAt: string | null;
    }>> = {};

    for (const step of invite.process.steps) {
      const week = step.week;
      if (!stepsByWeek[week]) stepsByWeek[week] = [];
      const prog = invite.progress.find((p) => p.stepId === step.id);
      stepsByWeek[week].push({
        id: step.id,
        title: step.title,
        description: step.description,
        week: step.week,
        type: step.type,
        materialUrl: step.materialUrl,
        order: step.order,
        completed: completedStepIds.has(step.id),
        completedAt: prog?.completedAt?.toISOString() || null,
        progressId: prog?.id || null,
        evidence: prog?.evidence || '',
        evidenceUrl: prog?.evidenceUrl || '',
        verifiedAt: prog?.verifiedAt?.toISOString() || null,
      });
    }

    const totalSteps = invite.process.steps.length;
    const completedSteps = completedStepIds.size;
    const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return apiSuccess({
      success: true,
      inviteId: invite.id,
      employeeName: invite.employeeName,
      employeeEmail: invite.employeeEmail,
      process: {
        id: invite.process.id,
        name: invite.process.name,
        description: invite.process.description,
        durationWeeks: invite.process.durationWeeks,
      },
      stepsByWeek,
      totalSteps,
      completedSteps,
      progressPercent,
    });
  } catch (error) {
    console.error('Invite access error:', error);
    return apiError('Error al acceder al proceso de onboarding.', 500);
  }
}
