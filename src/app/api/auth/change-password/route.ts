import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
import { apiError, apiSuccess } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminId, currentPassword, newPassword } = body;

    if (!adminId) return apiError('No autorizado.', 401);
    if (!currentPassword || !newPassword) return apiError('Ambas contraseñas son obligatorias.');
    if (newPassword.length < 6) return apiError('La nueva contraseña debe tener al menos 6 caracteres.');

    const admin = await db.admin.findUnique({ where: { id: adminId } });
    if (!admin) return apiError('Administrador no encontrado.', 404);

    if (admin.passwordHash && !verifyPassword(currentPassword, admin.passwordHash)) {
      return apiError('La contraseña actual no es correcta.');
    }

    const passwordHash = hashPassword(newPassword);
    await db.admin.update({ where: { id: adminId }, data: { passwordHash } });

    return apiSuccess({ success: true, message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Change password error:', error);
    return apiError('Error al cambiar la contraseña.', 500);
  }
}
