import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiError, apiSuccess } from '@/lib/api-utils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const employee = await db.employee.findUnique({ where: { id } });
    if (!employee) {
      return apiError('Empleado no encontrado.', 404);
    }

    const activeInvite = await db.invite.findFirst({
      where: {
        employeeEmail: employee.email,
        process: { adminId: employee.adminId },
      },
    });

    if (activeInvite) {
      return apiError(
        `No se puede eliminar a "${employee.name}" porque tiene una invitación activa en un proceso. Retíralo del proceso primero.`,
        409
      );
    }

    await db.employee.delete({ where: { id } });
    return apiSuccess({ success: true });
  } catch (error) {
    console.error('Delete employee error:', error);
    return apiError('Error al eliminar el empleado.', 500);
  }
}
