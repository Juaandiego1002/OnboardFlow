import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { progressCreateSchema, progressDeleteSchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('inviteId');

    if (!inviteId) {
      return apiError('Se requiere inviteId.');
    }

    const progress = await db.progress.findMany({
      where: { inviteId },
      include: { step: true },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess({ progress });
  } catch (error) {
    console.error('List progress error:', error);
    return apiError('Error al obtener el progreso.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = progressCreateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Se requiere inviteId y stepId.');
    }

    const { inviteId, stepId, evidence, evidenceUrl } = parsed.data;

    const existing = await db.progress.findUnique({
      where: { inviteId_stepId: { inviteId, stepId } },
    });

    if (existing) {
      return apiSuccess({ success: true, alreadyCompleted: true, progress: existing });
    }

    const progress = await db.progress.create({
      data: { inviteId, stepId, evidence, evidenceUrl },
    });

    return apiSuccess({ success: true, progress }, 201);
  } catch (error) {
    console.error('Progress error:', error);
    return apiError('Error al actualizar el progreso.', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = progressDeleteSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Se requiere inviteId y stepId.');
    }

    const { inviteId, stepId } = parsed.data;

    const existing = await db.progress.findUnique({
      where: { inviteId_stepId: { inviteId, stepId } },
    });

    if (!existing) {
      return apiError('No se encontró progreso para desmarcar.', 404);
    }

    await db.progress.delete({
      where: { inviteId_stepId: { inviteId, stepId } },
    });

    return apiSuccess({ success: true });
  } catch (error) {
    console.error('Delete progress error:', error);
    return apiError('Error al desmarcar la tarea.', 500);
  }
}
