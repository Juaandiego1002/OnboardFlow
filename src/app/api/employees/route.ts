import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiError, apiSuccess } from '@/lib/api-utils';
import { createEmployeeSchema, validateEmailExists } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');

    if (!adminId) {
      return apiError('Se requiere adminId.');
    }

    const employees = await db.employee.findMany({
      where: { adminId },
      orderBy: { name: 'asc' },
    });

    return apiSuccess({ employees });
  } catch (error) {
    console.error('List employees error:', error);
    return apiError('Error al obtener los empleados.', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createEmployeeSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0]?.message || 'Datos inválidos.');
    }

    const { adminId, name, email } = parsed.data;

    const domainResult = await validateEmailExists(email);
    if (domainResult !== true) {
      return apiError(domainResult);
    }

    const existingEmail = await db.employee.findUnique({
      where: { email_adminId: { email, adminId } },
    });
    if (existingEmail) {
      return apiError(`Ya existe un empleado registrado con el correo ${email}.`);
    }

    const existingName = await db.employee.findFirst({
      where: { adminId, name: { equals: name } },
    });
    if (existingName) {
      return apiError(`Ya existe un empleado registrado con el nombre "${name}".`);
    }

    const employee = await db.employee.create({
      data: { adminId, name, email },
    });

    return apiSuccess({ employee }, 201);
  } catch (error) {
    console.error('Create employee error:', error);
    return apiError('Error al crear el empleado.', 500);
  }
}
