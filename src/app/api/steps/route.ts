import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/steps — Add a step to a process
export async function POST(request: NextRequest) {
  try {
    const { processId, title, description, week, type, materialUrl, order } = await request.json();

    if (!processId || !title) {
      return NextResponse.json(
        { error: 'El título del paso es obligatorio.' },
        { status: 400 }
      );
    }

    const step = await db.step.create({
      data: {
        processId,
        title,
        description: description || '',
        week: week || 1,
        type: type || 'task',
        materialUrl: materialUrl || '',
        order: order || 0,
      },
    });

    return NextResponse.json({ step }, { status: 201 });
  } catch (error) {
    console.error('Create step error:', error);
    return NextResponse.json(
      { error: 'Error al crear el paso.' },
      { status: 500 }
    );
  }
}

// PUT /api/steps — Update a step (batch reorder or single update)
export async function PUT(request: NextRequest) {
  try {
    const { steps } = await request.json();

    if (!steps || !Array.isArray(steps)) {
      return NextResponse.json(
        { error: 'Se requiere un array de pasos.' },
        { status: 400 }
      );
    }

    // Batch update steps
    const results = await Promise.all(
      steps.map((step: { id: string; title?: string; description?: string; week?: number; type?: string; materialUrl?: string; order?: number }) =>
        db.step.update({
          where: { id: step.id },
          data: {
            ...(step.title !== undefined && { title: step.title }),
            ...(step.description !== undefined && { description: step.description }),
            ...(step.week !== undefined && { week: step.week }),
            ...(step.type !== undefined && { type: step.type }),
            ...(step.materialUrl !== undefined && { materialUrl: step.materialUrl }),
            ...(step.order !== undefined && { order: step.order }),
          },
        })
      )
    );

    return NextResponse.json({ steps: results });
  } catch (error) {
    console.error('Update steps error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar los pasos.' },
      { status: 500 }
    );
  }
}
