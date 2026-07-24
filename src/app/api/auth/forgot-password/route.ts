import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { apiError, apiSuccess } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return apiError('Correo electrónico no válido.');
    }

    const admin = await db.admin.findUnique({ where: { email } });
    if (!admin) {
      return apiError('No existe una cuenta con ese correo.');
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await db.admin.update({
      where: { id: admin.id },
      data: { resetToken, resetTokenExpiry },
    });

    return apiSuccess({
      success: true,
      message: 'Enlace de recuperación generado.',
      resetToken,
      email: admin.email,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return apiError('Error al procesar la solicitud.', 500);
  }
}
