import { NextResponse, type NextRequest } from 'next/server';
import { clearSteps, loadSteps, saveSteps } from '@/lib/stepsStore';
import type { StepperState } from '@/types';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ key: string }> };

const VALID_KEY = /^[\w.:-]{1,120}$/;

const fail = (error: unknown) =>
  NextResponse.json({ detail: `Redis no disponible: ${(error as Error).message}` }, { status: 503 });

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { key } = await params;
  if (!VALID_KEY.test(key)) return NextResponse.json({ detail: 'Clave inválida' }, { status: 400 });
  try {
    const state = await loadSteps(key);
    return state ? NextResponse.json(state) : NextResponse.json({ detail: 'Sin estado guardado' }, { status: 404 });
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { key } = await params;
  if (!VALID_KEY.test(key)) return NextResponse.json({ detail: 'Clave inválida' }, { status: 400 });
  const body = (await req.json().catch(() => null)) as StepperState | null;
  if (!body || typeof body.current !== 'number' || typeof body.data !== 'object') {
    return NextResponse.json({ detail: 'Estado inválido' }, { status: 400 });
  }
  try {
    return NextResponse.json(await saveSteps(key, body));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { key } = await params;
  if (!VALID_KEY.test(key)) return NextResponse.json({ detail: 'Clave inválida' }, { status: 400 });
  try {
    await clearSteps(key);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return fail(error);
  }
}
