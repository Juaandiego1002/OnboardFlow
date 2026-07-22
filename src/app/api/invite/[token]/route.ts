import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/invite/[token] — Employee accesses their onboarding
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: 'Este enlace no es válido o ha expirado. Pide a tu administrador que te envíe uno nuevo.' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'Este enlace no es válido o ha expirado. Pide a tu administrador que te envíe uno nuevo.' },
        { status: 404 }
      );
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: 'Este enlace ha expirado. Pide a tu administrador que te envíe uno nuevo.' },
        { status: 410 }
      );
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
      stepsByWeek[week].push({
        id: step.id,
        title: step.title,
        description: step.description,
        week: step.week,
        type: step.type,
        materialUrl: step.materialUrl,
        order: step.order,
        completed: completedStepIds.has(step.id),
        completedAt: invite.progress.find((p) => p.stepId === step.id)?.completedAt?.toISOString() || null,
      });
    }

    const totalSteps = invite.process.steps.length;
    const completedSteps = completedStepIds.size;
    const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return NextResponse.json({
      success: true,
      inviteId: invite.id,
      employeeName: invite.employeeName,
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
    return NextResponse.json(
      { error: 'Error al acceder al proceso de onboarding.' },
      { status: 500 }
    );
  }
}
