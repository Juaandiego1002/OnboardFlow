import { NextResponse } from 'next/server';

export function apiError(error: string, status: number = 400) {
  return NextResponse.json({ error }, { status });
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function getBodyOrError(body: unknown): { error?: string; data?: unknown } {
  if (!body || typeof body !== 'object') {
    return { error: 'Cuerpo de la solicitud inválido.' };
  }
  return { data: body };
}
