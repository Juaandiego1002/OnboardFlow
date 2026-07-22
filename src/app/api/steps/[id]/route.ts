import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/steps/[id] — Update a single step
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const step = await db.step.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.week !== undefined && { week: data.week }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.materialUrl !== undefined && { materialUrl: data.materialUrl }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return NextResponse.json({ step });
  } catch (error) {
    console.error('Update step error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el paso.' },
      { status: 500 }
    );
  }
}

// DELETE /api/steps/[id] — Delete a step
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.step.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete step error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el paso.' },
      { status: 500 }
    );
  }
}
