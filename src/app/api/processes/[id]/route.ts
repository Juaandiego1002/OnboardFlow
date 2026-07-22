import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/processes/[id] — Update a process
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, description, durationWeeks } = await request.json();

    const process = await db.onboardingProcess.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(durationWeeks && { durationWeeks }),
      },
      include: { steps: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json({ process });
  } catch (error) {
    console.error('Update process error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el proceso.' },
      { status: 500 }
    );
  }
}

// DELETE /api/processes/[id] — Delete a process
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.onboardingProcess.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete process error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el proceso.' },
      { status: 500 }
    );
  }
}
