import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiError, apiSuccess } from '@/lib/api-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { adminId } = body;

    if (!adminId) {
      return apiError('Se requiere adminId para verificar.');
    }

    const existing = await db.progress.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Progreso no encontrado.', 404);
    }

    if (existing.verifiedAt) {
      return apiSuccess({ success: true, alreadyVerified: true, progress: existing });
    }

    const progress = await db.progress.update({
      where: { id },
      data: { verifiedAt: new Date(), verifiedById: adminId },
    });

    return apiSuccess({ success: true, progress });
  } catch (error) {
    console.error('Verify progress error:', error);
    return apiError('Error al verificar la tarea.', 500);
  }
}
