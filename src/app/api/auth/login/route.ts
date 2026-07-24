import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { loginSchema } from '@/lib/validations';
import { verifyPassword } from '@/lib/password';
import { apiError, apiSuccess } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || 'Correo electrónico no válido');
    }

    const { email } = parsed.data;
    const { password } = body;

    if (email !== process.env.ADMIN_EMAIL) {
      return apiError('No tienes acceso como administrador. Usa el correo autorizado.', 403);
    }

    let admin = await db.admin.findUnique({ where: { email } });
    if (!admin) {
      admin = await db.admin.create({ data: { email } });
    }

    // Password-based login
    if (password) {
      if (!admin.passwordHash) {
        return apiError('No has configurado una contraseña. Usa el magic link o configura una desde el panel.', 400);
      }
      if (!verifyPassword(password, admin.passwordHash)) {
        return apiError('Contraseña incorrecta.', 401);
      }

      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await db.session.create({
        data: { adminId: admin.id, token, expiresAt },
      });

      return apiSuccess({
        success: true,
        adminId: admin.id,
        email: admin.email,
        token,
        direct: true,
        mode: 'password',
      });
    }

    // Magic link fallback
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.session.create({
      data: {
        adminId: admin.id,
        token,
        expiresAt,
      },
    });

    return apiSuccess({
      success: true,
      message: 'Magic link generado correctamente.',
      adminId: admin.id,
      email: admin.email,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return apiError('Error al procesar el login. Inténtalo de nuevo.', 500);
  }
}
