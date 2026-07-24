import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { processCreateSchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');

    if (!adminId) {
      return apiError('Se requiere adminId.');
    }

    const adminExists = await db.admin.findUnique({ where: { id: adminId } });
    if (!adminExists) {
      return apiError('Administrador no encontrado.', 404);
    }

    const processes = await db.onboardingProcess.findMany({
      where: { adminId },
      include: {
        steps: { orderBy: { order: 'asc' } },
        invites: {
          include: {
            progress: { include: { step: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess({ processes });
  } catch (error) {
    console.error('List processes error:', error);
    return apiError('Error al obtener los procesos.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = processCreateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || 'Datos inválidos.');
    }

    const { adminId, name, description, durationWeeks, steps } = parsed.data;

    const adminExists = await db.admin.findUnique({ where: { id: adminId } });
    if (!adminExists) {
      return apiError('Administrador no encontrado.', 404);
    }

    const process = await db.onboardingProcess.create({
      data: {
        name,
        description,
        durationWeeks,
        adminId,
        steps: steps && steps.length > 0
          ? { create: steps.map((s) => ({
              title: s.title,
              description: s.description,
              week: s.week,
              type: s.type,
              materialUrl: s.materialUrl,
              order: s.order,
            })) }
          : undefined,
      },
      include: { steps: { orderBy: { order: 'asc' } } },
    });

    return apiSuccess({ process }, 201);
  } catch (error) {
    console.error('Create process error:', error);
    return apiError('Error al crear el proceso.', 500);
  }
}
