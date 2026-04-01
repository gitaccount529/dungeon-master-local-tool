import { NextRequest, NextResponse } from 'next/server';
import { getCombatState, updateCombatState } from '@/lib/db';

export async function GET() {
  const state = getCombatState();
  return NextResponse.json(state);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const state = updateCombatState(body);
  return NextResponse.json(state);
}
