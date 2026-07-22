import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/processes/[id]/invite — Invite an employee
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { employeeName, employeeEmail } = await request.json();

    if (!employeeName || !employeeEmail || !employeeEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Nombre y correo del empleado son obligatorios.' },
        { status: 400 }
      );
    }

    const process = await db.onboardingProcess.findUnique({
      where: { id },
      include: { steps: true },
    });

    if (!process) {
      return NextResponse.json(
        { error: 'Proceso no encontrado.' },
        { status: 404 }
      );
    }

    const token = `inv_${process.id}_${employeeEmail.replace('@', '_at_')}_${Date.now()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const invite = await db.invite.create({
      data: {
        processId: id,
        employeeName,
        employeeEmail,
        token,
        expiresAt,
      },
    });

    const accessLink = token;

    return NextResponse.json({
      success: true,
      message: `Invitación enviada a ${employeeEmail}`,
      invite: {
        id: invite.id,
        employeeName: invite.employeeName,
        employeeEmail: invite.employeeEmail,
        token: invite.token,
        accessLink,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    console.error('Invite error:', error);
    return NextResponse.json(
      { error: 'No pudimos enviar el correo. Comprueba la dirección e inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
