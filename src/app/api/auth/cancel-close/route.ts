import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiError, apiSuccess } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminId } = body;

    if (!adminId) {
      return apiSuccess({ ok: true });
    }

    const session = await db.session.findFirst({
      where: { adminId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!session) {
      return apiSuccess({ ok: true });
    }

    await db.session.update({
      where: { id: session.id },
      data: { pendingExpireAt: null },
    });

    return apiSuccess({ ok: true });
  } catch (error) {
    console.error('cancel-close error:', error);
    return apiError('Error al cancelar cierre de pestaña', 500);
  }
}