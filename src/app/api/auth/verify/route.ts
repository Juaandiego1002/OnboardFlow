import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifySchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Token no válido.');
    }

    const { adminId } = parsed.data;

    const session = await db.session.findFirst({
      where: {
        adminId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!session) {
      return apiError('Sesión no válida o expirada. Inicia sesión nuevamente.', 401);
    }

    if (session.pendingExpireAt && session.pendingExpireAt <= new Date()) {
      await db.session.delete({ where: { id: session.id } });
      return apiError('Sesión expirada por cierre de pestaña. Inicia sesión nuevamente.', 401);
    }

    const admin = await db.admin.findUnique({
      where: { id: adminId },
      include: {
        processes: {
          include: {
            steps: { orderBy: { order: 'asc' } },
            invites: {
              include: {
                progress: { include: { step: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!admin) {
      return apiError('Administrador no encontrado.', 404);
    }

    return apiSuccess({
      success: true,
      admin: { id: admin.id, email: admin.email },
      processes: admin.processes,
    });
  } catch (error) {
    console.error('Verify error:', error);
    return apiError('Error al verificar la sesión.', 500);
  }
}
