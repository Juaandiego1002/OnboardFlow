import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/processes?adminId=xxx — List processes for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');

    if (!adminId) {
      return NextResponse.json(
        { error: 'Se requiere adminId.' },
        { status: 400 }
      );
    }

    const processes = await db.onboardingProcess.findMany({
      where: { adminId },
      include: {
        steps: { orderBy: { order: 'asc' } },
        invites: {
          include: {
            progress: { include: { step: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ processes });
  } catch (error) {
    console.error('List processes error:', error);
    return NextResponse.json(
      { error: 'Error al obtener los procesos.' },
      { status: 500 }
    );
  }
}

// POST /api/processes — Create a new process
export async function POST(request: NextRequest) {
  try {
    const { adminId, name, description, durationWeeks, steps } = await request.json();

    if (!adminId || !name) {
      return NextResponse.json(
        { error: 'El nombre del proceso es obligatorio.' },
        { status: 400 }
      );
    }

    const process = await db.onboardingProcess.create({
      data: {
        name,
        description: description || '',
        durationWeeks: durationWeeks || 4,
        adminId,
        steps: steps
          ? {
              create: steps.map(
                (step: { title: string; description?: string; week: number; type: string; materialUrl?: string; order: number }) => ({
                  title: step.title,
                  description: step.description || '',
                  week: step.week,
                  type: step.type || 'task',
                  materialUrl: step.materialUrl || '',
                  order: step.order || 0,
                })
              ),
            }
          : undefined,
      },
      include: { steps: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json({ process }, { status: 201 });
  } catch (error) {
    console.error('Create process error:', error);
    return NextResponse.json(
      { error: 'Error al crear el proceso.' },
      { status: 500 }
    );
  }
}
