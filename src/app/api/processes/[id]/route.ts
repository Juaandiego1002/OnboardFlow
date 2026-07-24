import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processUpdateSchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/api-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = processUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || 'Datos inválidos.');
    }

    const existing = await db.onboardingProcess.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Proceso no encontrado.', 404);
    }

    const process = await db.onboardingProcess.update({
      where: { id },
      data: parsed.data,
      include: { steps: { orderBy: { order: 'asc' } } },
    });

    return apiSuccess({ process });
  } catch (error) {
    console.error('Update process error:', error);
    return apiError('Error al actualizar el proceso.', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const process = await db.onboardingProcess.findUnique({
      where: { id },
      include: {
        invites: {
          include: {
            progress: { select: { id: true } },
          },
        },
      },
    });
    if (!process) {
      return apiError('Proceso no encontrado.', 404);
    }

    const invitesWithProgress = process.invites.filter((inv) => inv.progress.length > 0);
    if (invitesWithProgress.length > 0) {
      const names = invitesWithProgress.map((inv) => inv.employeeName).join(', ');
      return apiError(
        `No puedes eliminar este proceso porque ${invitesWithProgress.length > 1 ? 'los siguientes empleados tienen' : 'el siguiente empleado tiene'} progreso registrado: ${names}. Elimina primero sus invitaciones o espera a que finalicen.`,
        409
      );
    }

    await db.onboardingProcess.delete({ where: { id } });
    return apiSuccess({ success: true });
  } catch (error) {
    console.error('Delete process error:', error);
    return apiError('Error al eliminar el proceso.', 500);
  }
}
