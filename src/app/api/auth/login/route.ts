import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// POST /api/auth/login — Admin login with email (magic link simulation)
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Por favor, introduce un correo electrónico válido.' },
        { status: 400 }
      );
    }

    // Find or create admin
    let admin = await db.admin.findUnique({ where: { email } });
    if (!admin) {
      admin = await db.admin.create({ data: { email } });
    }

    // Generate a magic link token (valid for 1 hour)
    const token = uuidv4();
    // Store in a simple way: we use the admin ID as the token for simplicity in demo
    // In production this would be stored in a separate AuthToken table with expiry
    const magicToken = `magic_${admin.id}_${token}`;

    return NextResponse.json({
      success: true,
      message: 'Magic link generado correctamente.',
      adminId: admin.id,
      email: admin.email,
      token: magicToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error al procesar el login. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
