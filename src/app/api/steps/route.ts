import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { stepCreateSchema, stepBatchUpdateSchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = stepCreateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || 'El título del paso es obligatorio.');
    }

    const { processId, title, description, week, type, materialUrl, order } = parsed.data;

    const process = await db.onboardingProcess.findUnique({ where: { id: processId } });
    if (!process) {
      return apiError('Proceso no encontrado.', 404);
    }

    const step = await db.step.create({
      data: { processId, title, description, week, type, materialUrl, order },
    });

    return apiSuccess({ step }, 201);
  } catch (error) {
    console.error('Create step error:', error);
    return apiError('Error al crear el paso.', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = stepBatchUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Se requiere un array de pasos.');
    }

    const results = await Promise.all(
      parsed.data.steps.map((s) =>
        db.step.update({
          where: { id: s.id },
          data: {
            ...(s.title !== undefined && { title: s.title }),
            ...(s.description !== undefined && { description: s.description }),
            ...(s.week !== undefined && { week: s.week }),
            ...(s.type !== undefined && { type: s.type }),
            ...(s.materialUrl !== undefined && { materialUrl: s.materialUrl }),
            ...(s.order !== undefined && { order: s.order }),
          },
        })
      )
    );

    return apiSuccess({ steps: results });
  } catch (error) {
    console.error('Update steps error:', error);
    return apiError('Error al actualizar los pasos.', 500);
  }
}
