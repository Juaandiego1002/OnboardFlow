import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiError, apiSuccess } from '@/lib/api-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const existing = await db.step.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Paso no encontrado.', 404);
    }

    const step = await db.step.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.week !== undefined && { week: data.week }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.materialUrl !== undefined && { materialUrl: data.materialUrl }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return apiSuccess({ step });
  } catch (error) {
    console.error('Update step error:', error);
    return apiError('Error al actualizar el paso.', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.step.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Paso no encontrado.', 404);
    }

    await db.step.delete({ where: { id } });
    return apiSuccess({ success: true });
  } catch (error) {
    console.error('Delete step error:', error);
    return apiError('Error al eliminar el paso.', 500);
  }
}
