import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { inviteSchema, validateEmailExists } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/api-utils';
import { sendInviteEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || 'Nombre y correo del empleado son obligatorios.');
    }

    const { employeeName, employeeEmail } = parsed.data;

    const domainResult = await validateEmailExists(employeeEmail);
    if (domainResult !== true) {
      return apiError(domainResult);
    }

    const process = await db.onboardingProcess.findUnique({
      where: { id },
      include: { admin: true },
    });
    if (!process) {
      return apiError('Proceso no encontrado.', 404);
    }

    const existingInviteEmail = await db.invite.findFirst({
      where: { processId: id, employeeEmail },
    });
    if (existingInviteEmail) {
      return apiError(`"${employeeEmail}" ya ha sido invitado a este proceso.`);
    }

    const existingInviteName = await db.invite.findFirst({
      where: { processId: id, employeeName: { equals: employeeName } },
    });
    if (existingInviteName) {
      return apiError(`"${employeeName}" ya ha sido invitado a este proceso con otro correo.`);
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const invite = await db.invite.create({
      data: {
        processId: id,
        employeeName,
        employeeEmail,
        token,
        expiresAt,
      },
    });

    const emailResult = await sendInviteEmail({
      to: employeeEmail,
      employeeName,
      processName: process.name,
      token,
      adminName: process.admin?.name,
    });

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
    }

    return apiSuccess({
      success: true,
      message: `Invitación enviada a ${employeeEmail}`,
      emailSent: emailResult.success,
      invite: {
        id: invite.id,
        employeeName: invite.employeeName,
        employeeEmail: invite.employeeEmail,
        token: invite.token,
        accessLink: token,
        expiresAt: invite.expiresAt,
      },
    }, 201);
  } catch (error) {
    console.error('Invite error:', error);
    return apiError('No pudimos enviar el correo. Comprueba la dirección e inténtalo de nuevo.', 500);
  }
}
