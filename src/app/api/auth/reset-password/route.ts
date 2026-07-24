import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { apiError, apiSuccess } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token) return apiError('Token requerido.');
    if (!newPassword || newPassword.length < 6) {
      return apiError('La contraseña debe tener al menos 6 caracteres.');
    }

    const admin = await db.admin.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!admin) {
      return apiError('Enlace no válido o expirado. Solicita uno nuevo.', 400);
    }

    const passwordHash = hashPassword(newPassword);

    await db.admin.update({
      where: { id: admin.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });

    return apiSuccess({
      success: true,
      message: 'Contraseña restablecida correctamente. Ahora puedes iniciar sesión.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return apiError('Error al restablecer la contraseña.', 500);
  }
}
