import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/auth/verify — Verify magic link token
export async function POST(request: NextRequest) {
  try {
    const { adminId } = await request.json();

    if (!adminId) {
      return NextResponse.json(
        { error: 'Token no válido.' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'Token no válido o expirado.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email },
      processes: admin.processes,
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Error al verificar el token.' },
      { status: 500 }
    );
  }
}
