import { NextRequest, NextResponse } from 'next/server';
import { getSessionValue, setSessionValue } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });
  const value = getSessionValue(key);
  return NextResponse.json({ key, value });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { key, value } = body;
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });
  setSessionValue(key, value);
  return NextResponse.json({ key, value });
}
