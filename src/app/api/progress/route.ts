import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/progress — Mark a step as completed
export async function POST(request: NextRequest) {
  try {
    const { inviteId, stepId } = await request.json();

    if (!inviteId || !stepId) {
      return NextResponse.json(
        { error: 'Se requiere inviteId y stepId.' },
        { status: 400 }
      );
    }

    // Check if already completed
    const existing = await db.progress.findUnique({
      where: {
        inviteId_stepId: { inviteId, stepId },
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, alreadyCompleted: true });
    }

    // Create progress record
    const progress = await db.progress.create({
      data: { inviteId, stepId },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('Progress error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el progreso.' },
      { status: 500 }
    );
  }
}

// DELETE /api/progress — Unmark a step as completed
export async function DELETE(request: NextRequest) {
  try {
    const { inviteId, stepId } = await request.json();

    if (!inviteId || !stepId) {
      return NextResponse.json(
        { error: 'Se requiere inviteId y stepId.' },
        { status: 400 }
      );
    }

    await db.progress.delete({
      where: {
        inviteId_stepId: { inviteId, stepId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete progress error:', error);
    return NextResponse.json(
      { error: 'Error al desmarcar la tarea.' },
      { status: 500 }
    );
  }
}
