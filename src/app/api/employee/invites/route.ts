import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiError, apiSuccess } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    if (!email) {
      return apiError('Correo electrónico requerido.', 400);
    }

    const invites = await db.invite.findMany({
      where: {
        employeeEmail: email,
        expiresAt: { gt: new Date() },
      },
      include: {
        process: {
          select: {
            name: true,
            description: true,
            durationWeeks: true,
            _count: { select: { steps: true } },
          },
        },
        progress: { select: { stepId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = invites.map((invite) => {
      const totalSteps = invite.process._count.steps;
      const completedSteps = invite.progress.length;
      const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

      return {
        id: invite.id,
        token: invite.token,
        employeeName: invite.employeeName,
        processName: invite.process.name,
        processDescription: invite.process.description,
        durationWeeks: invite.process.durationWeeks,
        totalSteps,
        completedSteps,
        progressPercent,
        expiresAt: invite.expiresAt.toISOString(),
      };
    });

    return apiSuccess({ invites: result });
  } catch (error) {
    console.error('Employee invites error:', error);
    return apiError('Error al obtener los procesos del empleado.', 500);
  }
}
